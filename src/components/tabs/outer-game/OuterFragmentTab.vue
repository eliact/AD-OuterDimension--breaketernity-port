<script>
import { PlayerProgress } from "../../../core/player-progress";

export default {
  name: "OuterFragmentTab",
  components: {

  },
  data() {
    return {
      outers: 0,
      AntiBug: 0,
      InfBug: 0,
      BreakBug: 0,
      RepBug: 0,
      EterBug: 0,
      DilaBug: 0,
      RealBug: 0,
      layer: {
        reality: {
          isUnlocked: false,
        },
        dilation: {
          isUnlocked: false,
        },
        eternity: {
          isUnlocked: false,
        },
        replicanti: {
          isUnlocked: false,
        },
        break: {
          isUnlocked: false,
        },
        infinity: {
          isUnlocked: false,
        },
        antimatter: {
          isUnlocked: true,
        }
      },
      isInf: false,
      isBreak: false,
      isRep: false,
      isEter: false,
      isDil: false,
      isReal: false,
      isTeresa: false
    };
  },
  computed: {
    LayerClass() {
      return {
        "l-outer-fragment-tab--reality": this.isReal,
        "l-outer-fragment-tab--dilation": this.isDil,
        "l-outer-fragment-tab--eternity": this.isEter,
        "l-outer-fragment-tab--replicanti": this.isRep,
        "l-outer-fragment-tab--breakInf": this.isBreak,
        "l-outer-fragment-tab--Infinity": this.isInf,
        "l-outer-fragment-tab--Antimatter": true,
      };
    },
    SuperBug() {
      return player.bug.Super;
    },
    getLayer() {
      if (PlayerProgress.realityUnlocked()) return `Reality`;
      if (PlayerProgress.dilationUnlocked()) return `Dilation`;
      if (PlayerProgress.eternityUnlocked()) return `Eternity`;
      if (PlayerProgress.replicantiUnlocked()) return `Replicanti`;
      if (PlayerProgress.hasBroken()) return `Break Infinity`;
      if (PlayerProgress.infinityUnlocked()) return `Infinity`;
      return `Pre-Infinity`;
    },
  },
  methods: {
    update() {
      this.outers = player.outers;
      this.AntiBug = player.bug.Anti;
      this.InfBug = player.bug.Inf;
      this.BreakBug = player.bug.Break;
      this.RepBug = player.bug.Rep;
      this.EterBug = player.bug.Eter;
      this.DilaBug = player.bug.Dila;
      this.RealBug = player.bug.Real;

      const progress = PlayerProgress.current;
      const layer = this.layer;

      this.break = player.break;

      this.dilation = TimeStudy.dilation.isBought;

      const isInfinityUnlocked = progress.isInfinityUnlocked;
      layer.infinity.isUnlocked = isInfinityUnlocked;

      const isEternityUnlocked = progress.isEternityUnlocked;
      layer.eternity.isUnlocked = isEternityUnlocked;

      const isRealityUnlocked = progress.isRealityUnlocked;
      layer.reality.isUnlocked = isRealityUnlocked;


      this.isInf = PlayerProgress.infinityUnlocked();
      this.isBreak = PlayerProgress.hasBroken();
      this.isRep = PlayerProgress.replicantiUnlocked();
      this.isEter = PlayerProgress.eternityUnlocked();
      this.isReal = PlayerProgress.realityUnlocked();
      this.isTeresa = Teresa.isUnlocked;
    },
    actualLayer() {
      return getLayer();
    },
  }

};
</script>

<template>
  <div class="l-outer-fragment-tab">
    <div class="l-outer-fragment-tab--inner">
      <div
        v-if="isTeresa"
        class="l-outer-fragment-container__unavailable"
      >
        Something is Interfering
      </div>
      <div
        v-else
        class="l-outer-fragment-container"
      >
        <div
          class="l-outer-fragment-layer"
          :class="LayerClass"
        >
          You are currently in the {{ getLayer }} Era.
        </div>
        <div class="l-outer-fragment-bug">
          <div v-if="isReal">
            You have {{ quantifyInt("bug", RealBug ) }} in this Era.
          </div>
          <div v-else-if="isDil">
            You have {{ quantifyInt("bug", DilaBug) }} in this Era.
          </div>
          <div v-else-if="isEter">
            You have {{ quantifyInt("bug", EterBug) }} in this Era.
          </div>
          <div v-else-if="isRep">
            You have {{ quantifyInt("bug", RepBug) }} in this Era.
          </div>
          <div v-else-if="isBreak">
            You have {{ quantifyInt("bug", BreakBug) }} in this Era.
          </div>
          <div v-else-if="isInf">
            You have {{ quantifyInt("bug", InfBug) }} in this Era.
          </div>
          <div v-else>
            You have {{ quantifyInt("bug", AntiBug) }} in this Era.
          </div>
        </div>
        <div
          v-if="SuperBug"
          class="l-outer-fragment-SuperBug"
        >
          You got {{ quantifyInt("SuperBug" ,SuperBug) }} in all Era.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l-outer-fragment-tab--Antimatter {
  color: #8957e5;
}
.l-outer-fragment-tab--Infinity {
  color: var(--color-infinity);
}
.l-outer-fragment-tab--breakInf {
  color: var(--color-infinity);
}
.l-outer-fragment-tab--replicanti {
  color:  #fbc21b;
}
.l-outer-fragment-tab--eternity {
  color: var(--color-eternity);
}
.l-outer-fragment-tab--dilation {
  color: #64dd17;
}
.l-outer-fragment-tab--reality {
  color: var(--color-reality);
}
.l-outer-fragment-container__unavailable {
  width: 50rem;
  padding: 0.5rem;
  font-size: 4rem;
  color: var(--color-theEye--base);
  background: black;
  border: var(--var-border-width, 0.2rem) solid var(--color-theEye--base);
  border-radius: var(--var-border-radius, 0.5rem);
}
</style>