/* eslint-disable complexity */
import { DC } from "../constants";
import { GameMechanicState } from "../game-mechanics";

import { SteamRuntime } from "@/steam";

class AchievementState extends GameMechanicState {
  constructor(config) {
    super(config);
    this._row = Math.floor(this.id / 10);
    this._column = this.id % 10;
    this._bitmask = 1 << (this.column - 1);
    this._inverseBitmask = ~this._bitmask;
    this.registerEvents(config.checkEvent, args => this.tryUnlock(args));
  }

  get name() {
    return this.config.name;
  }

  get row() {
    return this._row;
  }

  get column() {
    return this._column;
  }

  get isPreReality() {
    return this.row < 14;
  }

  get isPrePelle() {
    return this.row < 18;
  }

  get isPreOuter() {
    return this.row < 19;
  }

  get isUnlocked() {
    return (player.achievementBits[this.row - 1] & this._bitmask) !== 0;
  }

  get isDisabled() {
    return Pelle.isDisabled("achievements") && Pelle.disabledAchievements.includes(this.id);
  }

  get isEffectActive() {
    return this.isUnlocked && !this.isDisabled;
  }

  tryUnlock(args) {
    if (this.isUnlocked) return;
    if (!this.config.checkRequirement(args)) return;
    this.unlock();
  }

  lock() {
    player.achievementBits[this.row - 1] &= this._inverseBitmask;
  }

  unlock(auto) {
    if (this.isUnlocked) return;
    player.achievementBits[this.row - 1] |= this._bitmask;
    if (this.id === 85 || this.id === 93) {
      Autobuyer.bigCrunch.bumpAmount(4);
    }
    if (this.id === 55 && !PlayerProgress.realityUnlocked()) {
      Modal.message.show(`Since you performed an Infinity in under a minute, the UI changed on the screen.
        Instead of the Dimensions disappearing, they stay and the Big Crunch button appears on top of them.
        This is purely visual, and is there to prevent flickering.`, {}, 3);
    }
    if (this.id === 148 || this.id === 166) {
      GameCache.staticGlyphWeights.invalidate();
    }
    if (auto) {
      GameUI.notify.reality(`Automatically unlocked: ${this.name}`);
    } else {
      GameUI.notify.success(`Achievement: ${this.name}`);
      SteamRuntime.activateAchievement(this.id);
    }
    if (player.speedrun.isActive && !player.speedrun.achievementTimes[this.id]) {
      // This stores a lot of data in the savefile and seems particularly suceptible to floating-point rounding issues
      // for some reason, so we floor to get rid of fractions of milliseconds and reduce what filesize impact we can
      player.speedrun.achievementTimes[this.id] = Math.floor(player.records.trueTimePlayed);
    }
    Achievements._power.invalidate();
    EventHub.dispatch(GAME_EVENT.ACHIEVEMENT_UNLOCKED);
  }
}

/**
 * @param {number} id
 * @returns {AchievementState}
 */
export const Achievement = AchievementState.createAccessor(GameDatabase.achievements.normal);

export const Achievements = {
  /**
   * @type {AchievementState[]}
   */
  all: Achievement.index.compact(),

  /**
   * @type {AchievementState[]}
   */
  get preReality() {
    return Achievements.all.filter(ach => ach.isPreReality);
  },

  /**
   * @type {AchievementState[]}
   */
  get prePelle() {
    return Achievements.all.filter(ach => ach.isPrePelle);
  },

  /**
   * @type {AchievementState[]}
   */
  get preOuter() {
    return Achievements.all.filter(ach => ach.isPreOuter);
  },

  get allRows() {
    const count = Achievements.all.map(a => a.row).nMax();
    return Achievements.rows(1, count);
  },

  get preRealityRows() {
    const count = Achievements.preReality.map(a => a.row).nMax();
    return Achievements.rows(1, count);
  },

  get prePelleRows() {
    const count = Achievements.prePelle.map(a => a.row).nMax();
    return Achievements.rows(1, count);
  },

  get preOuterRows() {
    const count = Achievements.preOuter.map(a => a.row).max();
    return Achievements.rows(1, count);
  },

  rows: (start, count) => Array.range(start, count).map(Achievements.row),

  row: row => Array.range(row * 10 + 1, 8).map(Achievement),

  get effectiveCount() {
    const unlockedAchievements = Achievements.all.countWhere(a => a.isUnlocked);
    return unlockedAchievements;
  },

  get period() {
    return GameCache.achievementPeriod.value;
  },

  get OuterPeriod() {
    if (!Achievements.preReality.every(a => a.isUnlocked)) return TimeSpan.fromMinutes(180).totalMilliseconds;
    return TimeSpan.fromMinutes(540).totalMilliseconds;
  },

  autoAchieveUpdate(diff) {
    if (!PlayerProgress.realityUnlocked()) return;
    if (!player.reality.autoAchieve || RealityUpgrade(8).isLockingMechanics || !PlayerProgress.outerUnlocked()) {
      // eslint-disable-next-line no-unused-expressions
      player.outers > 0
        ? player.reality.achTimer = Decimal.clampMax(player.reality.achTimer.add(diff), this.OuterPeriod)
        : player.reality.achTimer = Decimal.clampMax(player.reality.achTimer.add(diff), this.period);
      return;
    }
    if (Achievements.preReality.every(a => a.isUnlocked)) return;

    if (PlayerProgress.outerUnlocked()) {
      if (Achievements.preOuter.every(a => a.isUnlocked)) return;
    } else if (Achievements.preOuter.every(a => a.isUnlocked)) return;

    player.reality.achTimer = player.reality.achTimer.add(diff);
    // eslint-disable-next-line max-len
    if (((PlayerProgress.outerUnlocked() && player.reality.achTimer.lt(this.OuterPeriod) && !PlayerProgress.realityUnlocked()) ||
     // eslint-disable-next-line max-len
     (PlayerProgress.outerUnlocked() && Perk.achievementGroup5.isBought && player.reality.achTimer.lt(this.OuterPeriod))) ||
     (player.reality.achTimer.lt(this.period) && PlayerProgress.realityUnlocked())) return;

    // eslint-disable-next-line max-len
    if ((PlayerProgress.outerUnlocked() && !PlayerProgress.realityUnlocked()) || (PlayerProgress.outerUnlocked() && Perk.achievementGroup5.isBought)) {
      for (const achievements of Achievements.preOuter.filter(a => !a.isUnlocked)) {
        achievements.unlock(true);
        player.reality.achTimer = player.reality.achTimer.sub(this.OuterPeriod);
        if (player.reality.achTimer.lt(this.OuterPeriod)) break;
      }
    } else {
      for (const achievement of Achievements.preReality.filter(a => !a.isUnlocked)) {
        achievement.unlock(true);
        player.reality.achTimer = player.reality.achTimer.sub(this.period);
        if (player.reality.achTimer.lt(this.period)) break;
      }
    }
    player.reality.gainedAutoAchievements = true;
  },

  get timeToNextAutoAchieve() {
    if (!PlayerProgress.realityUnlocked() && !PlayerProgress.outerUnlocked()) return DC.D0;
    if (GameCache.achievementPeriod.value.eq(0) && !PlayerProgress.outerUnlocked()) return DC.D0;
    if (PlayerProgress.outerUnlocked()) {
      if (Achievements.all.countWhere(a => !a.isUnlocked) === 0) return DC.D0;
    } else if (Achievements.preReality.countWhere(a => !a.isUnlocked) === 0) return DC.D0;
    return PlayerProgress.outerUnlocked() ? this.OuterPeriod.sub(player.reality.achTimer)
      : this.period.sub(player.reality.achTimer);
  },

  _power: new Lazy(() => {
    const unlockedRows = Achievements.allRows
      .countWhere(row => row.every(ach => ach.isUnlocked));
    const basePower = Decimal.pow(1.25, unlockedRows).mul(Decimal.pow(1.03, Achievements.effectiveCount));
    const exponent = getAdjustedGlyphEffect("effarigachievement").mul(Ra.unlocks.achievementPower.effectOrDefault(1));
    return basePower.pow(exponent);
  }),

  get power() {
    if (Pelle.isDisabled("achievementMult")) return DC.D1;
    return Achievements._power.value;
  },

  updateSteamStatus() {
    for (const achievement of Achievements.all.filter(x => x.isUnlocked)) {
      SteamRuntime.activateAchievement(achievement.id);
    }
  }
};

EventHub.logic.on(GAME_EVENT.PERK_BOUGHT, () => {
  player.reality.achTimer = Decimal.min(player.reality.achTimer, Achievements.period);
});
