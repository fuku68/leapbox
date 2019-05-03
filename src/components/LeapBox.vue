<template>
  <div>
    <img ref="img" :src="img" @load="onLoaded" @click="onClick" :style="imgStyle">
    <template v-if="poped">
      <div class="popup">
        <div class="popup-inner" :style="frameStyle">
          <div class="close-btn" @click="onClose">
            <div class="close-slash"></div>
            <div class="close-back-slash"></div>
          </div>
          <img ref="popupImg" @wheel.prevent="onWheel" @mousedown="onMousedown" @mousemove="onMousemove" @mouseup="onMouseup" @mouseout="onMouseup" :style="popupImgStyle">
        </div>
        <div class="black-background" @click="onClose"></div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LeapBox',
  props: {
    img: { type: String },
    width: { type: String, default: '200px' },
    height: { type: String, default: '' },
    zoom: { type: Number, default: 0.010 },
  },
  data: function() {
    return {
      loaded: false,
      poped: false,
      dragging: false,
      previousEvent: null,
      frameWidth: 0,
      frameHeight: 0,
      imgNaturalWidth: 0,
      imgNaturalHeight: 0,
      initZoom: 1,
      imgWidth: 0,
      imgHeight: 0,
      imgPosX: 0,
      imgPosY: 0
    }
  },
  mounted: function() {
    window.addEventListener('resize', this.resizeHandler);
  },
  beforeDestroy: function() {
    window.removeEventListener('resize', this.resizeHandler);
  },
  computed: {
    framePadding: function() {
      return 50;
    },
    imgStyle: function() {
      return {
        width: this.width,
        height: this.height
      }
    },
    popupImgStyle: function() {
      return {
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${this.img})`,
        backgroundSize: `${this.imgWidth}px ${this.imgHeight}px`,
        backgroundPosition: `${this.imgPosX}px ${this.imgPosY}px`
      };
    },
    frameStyle: function() {
      return {
        width: `${this.frameWidth}px`,
        height: `${this.frameHeight}px`
      }
    }
  },
  methods: {
    /**
     * 画像のロード後の処理
     */
    onLoaded: function() {
      // 画像のサイズを取得
      this.imgNaturalWidth = this.$refs.img.naturalWidth;
      this.imgNaturalHeight = this.$refs.img.naturalHeight;
      this.loaded = true;
    },

    /**
     * 画像のポップアップ表示
     */
    onClick: function() {
      if (!this.loaded)
        return;

      this.calcSize();
      this.imgWidth = this.imgNaturalWidth * this.initZoom;
      this.imgHeight = this.imgNaturalHeight * this.initZoom;
      this.$nextTick(function() {
        this.poped = true;
      }.bind(this));
    },

    /**
     * ポップアップのクローズ処理
     */
    onClose: function() {
      this.poped = false;
    },
    onWheel: function(e) {
      let deltaY = 0;
      if (e.deltaY) {
        deltaY = e.deltaY;
      } else {
        deltaY = -e.wheelDelta;
      }

      let rect = this.$refs.popupImg.getBoundingClientRect();
      let offsetX = e.pageX - rect.left - window.pageXOffset;
      let offsetY = e.pageY - rect.top - window.pageYOffset;

      let imgCursorX = offsetX - this.imgPosX;
      let imgCursorY = offsetY - this.imgPosY;

      let imgRatioX = imgCursorX/this.imgWidth;
      let imgRatioY = imgCursorY/this.imgHeight;

      if (deltaY < 0) {
        this.imgWidth += this.imgWidth * this.zoom;
        this.imgHeight += this.imgHeight * this.zoom;
      } else {
        this.imgWidth -= this.imgWidth * this.zoom;
        this.imgHeight -= this.imgHeight * this.zoom;
      }

      this.imgPosX = offsetX - (this.imgWidth * imgRatioX);
      this.imgPosY = offsetY - (this.imgHeight * imgRatioY);
      this.ajustSizePos();
    },

    /**
     * サイズとポジションの調整処理
     */
    ajustSizePos: function() {
      if (this.imgWidth <= this.imgNaturalWidth * this.initZoom || this.imgHeight <= this.imgNaturalHeight * this.initZoom) {
        this.reset();
      } else {
        if (this.imgPosX > 0) {
          this.imgPosX = 0;
        } else if (this.imgPosX < this.imgNaturalWidth * this.initZoom - this.imgWidth) {
          this.imgPosX = this.imgNaturalWidth * this.initZoom - this.imgWidth;
        }

        if (this.imgPosY > 0) {
          this.imgPosY = 0;
        } else if (this.imgPosY < this.imgNaturalHeight * this.initZoom - this.imgHeight) {
          this.imgPosY = this.imgNaturalHeight * this.initZoom - this.imgHeight;
        }
      }
    },

    /**
     * mousedownイベント処理
     */
    onMousedown: function(event) {
      this.previousEvent = event;
      this.dragging = true;
    },

    /**
     * mousemoveイベント処理
     */
    onMousemove: function(event) {
      if (!this.dragging || this.previousEvent === null)
        return;

      this.imgPosX += (event.pageX - this.previousEvent.pageX);
      this.imgPosY += (event.pageY - this.previousEvent.pageY);
      this.previousEvent = event;

      this.ajustSizePos();
    },

    /**
     * mouseupイベント処理
     */
    onMouseup: function() {
      this.previousEvent = null;
      this.dragging = false;
    },

    /**
     * リサイズ時の処理
     */
    resizeHandler: function() {
      if (!this.poped)
        return;
      this.calcSize();
      this.ajustSizePos();
    },
    /**
     * ポップアップ表示の大きさを計算
     */
    calcSize() {
      let docWidth = document.documentElement.clientWidth;
      let docHeight = document.documentElement.clientHeight;
      if (docWidth / docHeight > this.imgNaturalWidth / this.imgNaturalHeight) {
        // 高さで制限
        // frame内のpaddingを考慮
        this.frameHeight = docHeight - 50;
        let frameInnerHeight = this.frameHeight - this.framePadding * 2;
        this.frameWidth = (this.imgNaturalWidth * frameInnerHeight / this.imgNaturalHeight) + this.framePadding * 2;
        this.initZoom = frameInnerHeight / this.imgNaturalHeight;
      } else {
        // 幅で制限
        this.frameWidth = docWidth - 50;
        let frameInnerWidth = this.frameWidth - this.framePadding * 2;
        this.frameHeight = (this.imgNaturalHeight * frameInnerWidth / this.imgNaturalWidth) + this.framePadding * 2;
        this.initZoom = frameInnerWidth / this.imgNaturalWidth;
      }
    },
    /**
     * 画像サイズのリセット
     */
    reset: function() {
      this.imgWidth = this.imgNaturalWidth * this.initZoom;
      this.imgHeight = this.imgNaturalHeight * this.initZoom;
      this.imgPosX = this.imgPosY = 0;
    }
  }
}
</script>

<style scoped>
.popup {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  z-index: 9999;
  opacity: 1;
  transition: .6s;
}

.popup-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 50%;
  padding: 50px;
  background-color: #fff;
  z-index: 2;
  box-sizing: border-box;
}

.popup-inner .close-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  cursor: pointer;
}

.popup-inner .close-btn .close-slash {
  position: absolute;
  width: 40px;
  height: 2px;
  top: 50%;
  left: 50%;
  background: black;
  transform: translate(-50%,-50%) rotate(45deg);
}

.popup-inner .close-btn .close-back-slash {
  position: absolute;
  width: 40px;
  height: 2px;
  top: 50%;
  left: 50%;
  background: black;
  transform: translate(-50%,-50%) rotate(-45deg);
}

.popup-inner img {
  width: 100%;
  height: 100%;
}

.black-background {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.8);
  z-index: 1;
  cursor: pointer;
}
</style>
