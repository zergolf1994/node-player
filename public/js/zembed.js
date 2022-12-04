if (top.location == self.location) {
  window.location = "https://www.google.com/";
} else {
  class _0xaed1 {
    async init() {
      this._devtools();
      const n = document.getElementById(`${zembed.id}`);
      this.slug = zembed.slug;
      this.statisToken = zembed.token;
      this.host = zembed.host;
      await this._jwpcdn();
      await this._jquery();
      this.data = await this._get();

      if (this.data.status) {
        this.custom = JSON.parse(this.data.player.custom) || {};
        this._setup();
      }

      if (this.statisToken) {
        this._StatisUpdate(15000);
      }
    }
    async _StatisUpdate(inv) {
      setInterval(() => {
        let a = {
          token: this.statisToken,
          lastseenAt: new Date().toISOString(),
        };
        const o = new XMLHttpRequest();
        o.open("POST", "/statis/update", !0),
          o.setRequestHeader("Content-Type", "application/json; charset=utf-8"),
          o.send(JSON.stringify(a));
      }, inv);
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
      if (this.data.player.advert) {
        await this._playerwithadvert();
      } else {
        await this.p2p_player();
      }
    }
    async _playerwithadvert() {
      let playerwithadvert = jwplayer("player"),
        slug = this.slug,
        ContinueDialog = this.custom.continue == "on" ? true : false;

      playerwithadvert.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99";
      playerwithadvert.width = "100%";
      playerwithadvert.height = "100%";
      playerwithadvert.preload = "auto";
      playerwithadvert.primary = "html5";
      playerwithadvert.hlshtml = "true";
      playerwithadvert.controls = "true";
      playerwithadvert.autostart = this.custom.autoplay == "on" ? true : false;
      playerwithadvert.title =
        this.custom.show_title == "on" ? this.data.file.title : "";
      playerwithadvert.mute = this.custom.mute == "on" ? true : false;
      playerwithadvert.repeat = this.custom.repeat == "on" ? true : false;
      playerwithadvert.image = this.data.video.image;
      playerwithadvert.sources = [
        { file: `//${this.host}/processing.mp4`, type: "video/mp4" },
      ];
      if (this.data.player.advert) {
        playerwithadvert.advertising = {
          client: "vast",
          schedule: [
            {
              tag: this.data.player.advert,
              offset: "pre",
            },
          ],
        };
      }
      playerwithadvert.setup(playerwithadvert);
      playerwithadvert.once("play", () => {
        playerwithadvert.remove();
        this.p2p_player({ auto: true });
      });
    }
    async p2p_player(set) {
      let div = document.createElement("div");
      div.id = "p2p_data";
      document.body.prepend(div);

      await waitForGlobalObject("p2pml", "core");
      //this.isP2PSupported = p2pml.core.HybridLoader.isSupported();
      this.isP2PSupported = false;

      this.downloadStats = [];
      this.downloadTotals = { http: 0, p2p: 0 };
      this.Users = [];
      this.uploadStats = [];
      this.uploadTotal = 0;
      const config = {
        loader: {
          trackerAnnounce: [
            "wss://tracker.btorrent.xyz/",
            "wss://tracker.openwebtorrent.com/",
          ],
          cachedSegmentExpiration: 86400000,
          cachedSegmentsCount: 1000,
          requiredSegmentsPriority: 50,
          httpDownloadMaxPriority: 100,
          httpDownloadProbability: 100,
          httpDownloadProbabilityInterval: 1000,
          httpDownloadProbabilitySkipIfNoPeers: true,
          p2pDownloadMaxPriority: 100,
          httpFailedSegmentTimeout: 10000,
          simultaneousP2PDownloads: 5,
          simultaneousHttpDownloads: 5,
          httpDownloadInitialTimeout: 60000,
          httpDownloadInitialTimeoutPerSegment: 3000,
          httpUseRanges: true,
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
            ],
          },
        },
      };
      this.engine = this.isP2PSupported
        ? new p2pml.hlsjs.Engine(config)
        : undefined;
      if (this.isP2PSupported) {
        this.engine.on(
          p2pml.core.Events.PieceBytesDownloaded,
          this.onBytesDownloaded.bind(this)
        );
        this.engine.on(
          p2pml.core.Events.PieceBytesUploaded,
          this.onBytesUploaded.bind(this)
        );
        this.engine.on(
          p2pml.core.Events.PeerConnect,
          this.onPeerConnect.bind(this)
        );
        this.engine.on(
          p2pml.core.Events.PeerClose,
          this.onPeerClose.bind(this)
        );
        //var trackerAnnounce = this.engine.getSettings().loader.trackerAnnounce;
      }
      await this._player(set);
    }
    async _player(set) {
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
      if (!this.isP2PSupported) {
        player.autostart =
          this.custom.autoplay == "on" ? true : set?.auto ? true : false;
      }
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
      /*if (this.data.player.advert) {
        player.advertising = {
          client: "vast",
          schedule: [
            {
              tag: this.data.player.advert,
              offset: "pre",
            },
          ],
        };
      }*/
      if (this.data.tracks.file) {
        player.tracks = [
          {
            kind: this.data.tracks.kind,
            file: this.data.tracks.file,
          },
        ];
      }
      player.setup(player);

      if (this.isP2PSupported) {
        jwplayer_hls_provider.attach();
        p2pml.hlsjs.initJwPlayer(player, {
          liveSyncDurationCount: 7,
          loader: this.engine.createLoaderClass(),
        });
      }
      if (set?.auto) {
        //player.play();
      }
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
          $jrwn.remove();
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
    onBytesDownloaded(method, size) {
      this.downloadStats.push({
        method: method,
        size: size,
        timestamp: performance.now(),
      });
      this.downloadTotals[method] += size;
      var httpMb = this.downloadTotals.http / 1048576;
      var p2pMb = this.downloadTotals.p2p / 1048576;
      var totalMb = httpMb + p2pMb;
      this.data.p2p = Number((p2pMb * 100) / totalMb).toFixed(0);
      this.data.http = Number((httpMb * 100) / totalMb).toFixed(0);
      this.data.users = this.Users.length + 1;

      $("#p2p_data").html(`
      <span class="peers">Peer : 0</span>
      <span class="p2p">P2P : 0%</span>
      <span class="http">HTTP : 0%</span>`);

      if (this.data.users > 0) {
        $("#p2p_data span.peers").text(`Peer : ${this.data.users}`);
        if ($("#p2p_data span.peers").hasClass("hidden")) {
          $("#p2p_data span.peers").removeClass("hidden");
        }
      } else {
        if (!$("#p2p_data span.peers").hasClass("hidden")) {
          $("#p2p_data span.peers").addClass("hidden");
        }
      }

      if (this.data.p2p > 0) {
        $("#p2p_data span.p2p").text(`P2P : ${this.data.p2p}%`);
        if ($("#p2p_data span.p2p").hasClass("hidden")) {
          $("#p2p_data span.p2p").removeClass("hidden");
        }
      } else {
        if (!$("#p2p_data span.p2p").hasClass("hidden")) {
          $("#p2p_data span.p2p").addClass("hidden");
        }
      }
      if (this.data.http > 0) {
        $("#p2p_data span.http").text(`HTTP : ${this.data.http}%`);
        if ($("#p2p_data span.http").hasClass("hidden")) {
          $("#p2p_data span.http").removeClass("hidden");
        }
      } else {
        if (!$("#p2p_data span.http").hasClass("hidden")) {
          $("#p2p_data span.http").addClass("hidden");
        }
      }
    }
    onBytesUploaded(method, size) {
      this.uploadStats.push({ size: size, timestamp: performance.now() });
      this.uploadTotal += size;
    }
    onPeerConnect(peer) {
      this.Users.push(peer.id);
    }
    onPeerClose(id) {
      const index = this.Users.indexOf(id);
      if (index > -1) {
        this.Users.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
    async _devtools() {}
  }
  const jw = new _0xaed1();
  jw.init();
  /*function p2p_player() {
    console.log("play")
  }*/
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
  function waitForGlobalObject(objectName, objectNextName) {
    return new Promise((resolve) => {
      function check() {
        if (
          window[objectName] !== undefined &&
          (objectNextName === undefined ||
            window[objectName][objectNextName] !== undefined)
        ) {
          resolve();
        } else {
          setTimeout(check, 200);
        }
      }

      check();
    });
  }
}
