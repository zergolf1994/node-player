class JwplayerClass {
  async init() {
    const n = document.getElementById("load-player");
    this.sources = sources;
    this.image = image;
    this.slug = n.getAttribute("data-slug");
    this.Restart();
  }
  async Restart() {
    this.JwPlayer();
  }
  async JwPlayer() {
    let slug = this.slug;
    let player = jwplayer("player");
    player.key = "W7zSm81+mmIsg7F+fyHRKhF3ggLkTqtGMhvI92kbqf/ysE99";
    player.width = "100%";
    player.height = "100%";
    player.preload = "auto";
    player.primary = "html5";
    player.hlshtml = "true";
    player.controls = "true";
    player.sources = this.sources;
    player.image = this.image;
    player.setup(player);

    /*let rewindIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-rewind" viewBox="0 0 1024 1024" focusable="false"><path d="M455.68 262.712889l-67.072 79.644444-206.904889-174.08 56.775111-38.627555a468.48 468.48 0 1 1-201.216 328.817778l103.310222 13.141333a364.487111 364.487111 0 0 0 713.614223 139.605333 364.373333 364.373333 0 0 0-479.971556-435.541333l-14.904889 5.973333 96.312889 81.066667zM329.955556 379.505778h61.610666v308.167111H329.955556zM564.167111 364.088889c61.269333 0 110.933333 45.511111 110.933333 101.717333v135.566222c0 56.149333-49.664 101.660444-110.933333 101.660445s-110.933333-45.511111-110.933333-101.660445V465.749333c0-56.149333 49.664-101.660444 110.933333-101.660444z m0 56.490667c-27.249778 0-49.322667 20.252444-49.322667 45.226666v135.566222c0 24.974222 22.072889 45.169778 49.322667 45.169778 27.192889 0 49.265778-20.195556 49.265778-45.169778V465.749333c0-24.917333-22.072889-45.169778-49.265778-45.169777z" p-id="7377"></path></svg>';
    */
    let rewindIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-rewind" viewBox="0 0 16 16">
      <path d="M7.21 5.093A.5.5 0 0 1 8 5.5v1.886l3.21-2.293A.5.5 0 0 1 12 5.5v5a.5.5 0 0 1-.79.407L8 8.614V10.5a.5.5 0 0 1-.79.407l-3.5-2.5a.5.5 0 0 1 0-.814l3.5-2.5Z"/>
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4Z"/>
    </svg>`;

    /*let forwardIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-forward" viewBox="0 0 1024 1024" focusable="false"><path d="M561.948444 262.712889l67.015112 79.644444 206.961777-174.08-56.832-38.627555a468.48 468.48 0 1 0 201.216 328.817778l-103.310222 13.141333a364.487111 364.487111 0 0 1-713.557333 139.605333 364.373333 364.373333 0 0 1 479.971555-435.541333l14.904889 5.973333-96.369778 81.066667zM329.955556 379.505778h61.610666v308.167111H329.955556zM564.167111 364.088889c61.269333 0 110.933333 45.511111 110.933333 101.717333v135.566222c0 56.149333-49.664 101.660444-110.933333 101.660445s-110.933333-45.511111-110.933333-101.660445V465.749333c0-56.149333 49.664-101.660444 110.933333-101.660444z m0 56.490667c-27.249778 0-49.322667 20.252444-49.322667 45.226666v135.566222c0 24.974222 22.072889 45.169778 49.322667 45.169778 27.192889 0 49.265778-20.195556 49.265778-45.169778V465.749333c0-24.917333-22.072889-45.169778-49.265778-45.169777z" p-id="7407"></path></svg>';
    */
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

    /*player.on("buffer", function (e) {
      console.log(e);
    });*/
    player.on("time", function (e) {
      setLocal(`time_${slug}`, `${e.position}`);
    });

    player.once("play", function () {
      let resumeAt = getLocal(`time_${slug}`);
      if (resumeAt && Math.floor(resumeAt) != 0) {
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
    player.once("beforePlay", function () {
      let $jrwn = $(".jw-icon-rewind"),
        $rwn = $('[button="rewind"]'),
        $fwd = $('[button="forward"]');
      if ($jrwn.length) {
        $jrwn.after($rwn);
        $rwn.after($fwd);
        $jrwn.remove();
      }
    });
  }
}
const jw = new JwplayerClass();
jw.init();
function setLocal(name, value) {
  localStorage.setItem(name, value);
}
function getLocal(name) {
  return localStorage.getItem(name);
}
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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
