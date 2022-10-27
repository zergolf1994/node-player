if (top.location == self.location) {
  window.location = "https://www.google.com/";
} else {
  class _0xaed1 {
    async init() {
      await this._jwpcdn();
      await this._jquery();
      this._devtools();
      const n = document.getElementById("load-player");
      this.slug = n.getAttribute("data-slug");
      this.data = await this._get();
      if (this.data.status) {
        this.custom = JSON.parse(this.data.player.custom) || {};
        this._setup();
      }
    }
    async _get() {
      let a = { slug: this.slug };
      const o = new XMLHttpRequest();
      return new Promise(function (resolve, reject) {
        o.open("POST", "/api/get", !0),
          o.setRequestHeader("Content-Type", "application/json; charset=utf-8"),
          o.send(JSON.stringify(a));
        o.onload = function (e) {
          if (this.status == 200) {
            resolve(JSON.parse(this.response));
          } else {
            reject(JSON.parse(this.response));
          }
        };
      });
    }
    async _setup() {
      let div = document.createElement("div");
      div.id = "player";
      document.body.prepend(div);
      await this._player();
    }
    async _player() {
    
      let player = jwplayer("player"),
        slug = this.slug,
        ContinueDialog = this.custom.continue == "on" ? true : false;

      player.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99";
      player.width = "100%";
      player.height = "100%";
      player.preload = "auto";
      player.primary = "html5";
      player.hlshtml = "true";
      player.controls = "true";
      player.autostart = this.custom.autoplay == "on" ? true : false;
      player.title = this.custom.show_title == "on" ? this.data.file.title : "";
      player.mute = this.custom.mute == "on" ? true : false;
      player.repeat = this.custom.repeat == "on" ? true : false;
      player.image = this.data.video.image;
      player.sources = [
        { file: this.data.video.file, type: this.data.video.fileType },
      ];
      player.skin = {
        controlbar: {
          iconsActive: this.custom.color,
        },
        timeslider: {
          progress: this.custom.color,
        },
        menus: {
          background: "#121212",
          textActive: this.custom.color,
        },
      };
      if (this.data.player.active_advert) {
        player.advertising = {
          client: "vast",
          schedule: [
            {
              tag: this.data.video.advert,
              offset: "pre",
            },
          ],
        };
      }
      if (this.data.tracks.file) {
        player.tracks = [
          {
            kind: this.data.tracks.kind,
            file: this.data.tracks.file,
          },
        ];
      }
      player.setup(player);

      player.once("play", function () {
        let resumeAt = getLocal(`time_${slug}`);
        if (resumeAt && Math.floor(resumeAt) != 0 && ContinueDialog) {
          //player.seek(resumeAt).pause();
          player.pause();
          $("body").prepend(`
          <div class="modals">
            <div class="modal">
              <div class="modal-body">
                <span>Continue watching at ${SecondsConvert(resumeAt)}</span>
              </div>
              <div class="modal-footer">
                <button class="continue_submit">Continue</button>
                <button class="continue_cancle">Cancle</button>
              </div>
            </div>
          </div>`);
          $(".continue_submit").click(() => {
            player.seek(resumeAt).play();
            $(".modals").remove();
          });
          $(".continue_cancle").click(() => {
            player.seek(0).play();
            $(".modals").remove();
          });
        }
      });

      player.on("time", function (e) {
        setLocal(`time_${slug}`, e.position);
      });

      let rewindIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-rewind" viewBox="0 0 16 16">
        <path d="M7.21 5.093A.5.5 0 0 1 8 5.5v1.886l3.21-2.293A.5.5 0 0 1 12 5.5v5a.5.5 0 0 1-.79.407L8 8.614V10.5a.5.5 0 0 1-.79.407l-3.5-2.5a.5.5 0 0 1 0-.814l3.5-2.5Z"/>
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4Z"/>
        </svg>`;
      let forwardIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-forward" viewBox="0 0 16 16">
        <path d="M8.79 5.093A.5.5 0 0 0 8 5.5v1.886L4.79 5.093A.5.5 0 0 0 4 5.5v5a.5.5 0 0 0 .79.407L8 8.614V10.5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5Z"/>
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4Z"/>
        </svg>`;

      player.addButton(
        rewindIcon,
        "Rewind 30 Seconds",
        function () {
          var seek = 0,
            time = player.getPosition() - 30;
          seek = time <= 0 ? 0 : time;
          player.seek(seek);
        },
        "rewind"
      );
      player.addButton(
        forwardIcon,
        "Forward 30 Seconds",
        function () {
          var seek = 0,
            time = player.getPosition() + 30;
          seek = time <= 0 ? 0 : time;
          player.seek(seek);
        },
        "forward"
      );

      player.once("beforePlay", function () {
        let $jrwn = $(".jw-icon-rewind"),
          $rwn = $('[button="rewind"]'),
          $fwd = $('[button="forward"]');
        if ($jrwn.length) {
          $jrwn.after($rwn);
          $rwn.after($fwd);
          //$jrwn.remove();
          //$(".jw-display-icon-rewind").remove();
        }
      });
    }
    async _jwpcdn() {
      //script
      let script = document.createElement("script");
      script.src = "https://ssl.p.jwpcdn.com/player/v/8.18.2/jwplayer.js";
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;
      document.getElementsByTagName("head")[0].appendChild(script);
      script.onload = function () {
        return true;
      };
    }
    async _jquery() {
      //script
      let script = document.createElement("script");
      script.src = "https://code.jquery.com/jquery-3.6.1.min.js";
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;
      document.getElementsByTagName("head")[0].appendChild(script);
      script.onload = function () {
        return true;
      };
    }
    async _devtools() {}
  }
  const jw = new _0xaed1();
  jw.init();

  function setLocal(name, value) {
    localStorage.setItem(name, value);
  }
  function getLocal(name) {
    return localStorage.getItem(name);
  }
  function SecondsConvert(sec) {
    let totalSeconds = Math.floor(sec);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    return hours + ":" + minutes + ":" + seconds;
  }
}
