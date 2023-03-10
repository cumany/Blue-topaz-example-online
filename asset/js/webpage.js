jQuery(function () {
  // THEME TOGGLE

  // load saved theme state
  if (localStorage.getItem("theme_toggle") != null) {
    setThemeToggle(localStorage.getItem("theme_toggle") == "true");
  }

  var lastScheme = "theme-dark";
  // change theme to match current system theme
  if (
    localStorage.getItem("theme_toggle") == null &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    setThemeToggle(true);
    lastScheme = "theme-light";
  }
  if (
    localStorage.getItem("theme_toggle") == null &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    setThemeToggle(true);
    lastScheme = "theme-dark";
  }
  //mobileservice.
  var ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    if ($("body").hasClass("is-mobile")) {
      $("body").removeClass("is-mobile");
    } else {
      $("body").addClass("is-mobile");
    }
  } else {
    if ($("body").hasClass("is-mobile")) {
      $("body").removeClass("is-mobile");
    }
  }
  // set initial toggle state based on body theme class
  if ($("body").hasClass("theme-light")) {
    setThemeToggle(true);
  } else {
    setThemeToggle(false);
  }

  function setThemeToggle(state, instant = false) {
    $(".toggle__input").each(function () {
      $(this).prop("checked", state);
    });

    if (!$(".toggle__input").hasClass("is-checked") && state) {
      $(".toggle__input").addClass("is-checked");
    } else if ($(".toggle__input").hasClass("is-checked") && !state) {
      $(".toggle__input").removeClass("is-checked");
    }

    if (!state) {
      if ($("body").hasClass("theme-light")) {
        $("body").removeClass("theme-light");
      }

      if (!$("body").hasClass("theme-dark")) {
        $("body").addClass("theme-dark");
      }
    } else {
      if ($("body").hasClass("theme-dark")) {
        $("body").removeClass("theme-dark");
      }

      if (!$("body").hasClass("theme-light")) {
        $("body").addClass("theme-light");
      }
    }

    localStorage.setItem("theme_toggle", state ? "true" : "false");
  }

  $(".toggle__input").on("click", function () {
    setThemeToggle(!(localStorage.getItem("theme_toggle") == "true"));
  });

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      // return if we are printing
      if (window.matchMedia("print").matches) {
        printing = true;
        return;
      }

      let newColorScheme = event.matches ? "theme-dark" : "theme-light";

      if (newColorScheme == lastScheme) return;

      if (newColorScheme == "theme-dark") {
        setThemeToggle(false);
        console.log("dark");
      }

      if (newColorScheme == "theme-light") {
        setThemeToggle(true);
      }

      lastScheme = newColorScheme;
    });

  // MAKE CALLOUTS COLLAPSIBLE
  // if the callout title is clicked, toggle the display of .callout-content
  $(".callout.is-collapsible .callout-title").on("click", function () {
    var isCollapsed = $(this).parent().hasClass("is-collapsed");

    if (isCollapsed) {
      $(this).parent().toggleClass("is-collapsed");
    }

    $(this)
      .parent()
      .find(".callout-content")
      .slideToggle(
        (duration = 100),
        (complete = function () {
          if (!isCollapsed) {
            $(this).parent().toggleClass("is-collapsed");
          }
        })
      );
  });

  // MAKE HEADERS COLLAPSIBLE
  // if "heading-collapse-indicator" is clicked, toggle the display of every div until the next heading of the same or lower level

  function getHeadingContentsSelector(header) {
    let headingLevel = $(header)
      .children()
      .first()
      .prop("tagName")
      .toLowerCase();
    let headingNumber = parseInt(headingLevel.replace("h", ""));

    let endingHeadings = [1, 2, 3, 4, 5, 6]
      .filter(function (item) {
        return item <= headingNumber;
      })
      .map(function (item) {
        return `div:has(h${item})`;
      });

    let endingHeadingsSelector = endingHeadings.join(", ");

    return endingHeadingsSelector;
  }

  function setHeaderCollapse(header, collapse) {
    let selector = getHeadingContentsSelector($(header));

    if (!collapse) {
      if ($(header).hasClass("is-collapsed"))
        $(header).toggleClass("is-collapsed");

      $(header).nextUntil(selector).show();

      // close headers inside of this one that are collapsed
      $(header)
        .nextUntil(selector)
        .each(function () {
          if ($(this).hasClass("is-collapsed"))
            setHeaderCollapse($(this), true);
        });

      //open headers above this one that are collapsed
      lastHeaderSize = $(header)
        .children()
        .first()
        .prop("tagName")
        .toLowerCase()
        .replace("h", "");
      $(header)
        .prevAll()
        .each(function () {
          if (
            $(this).hasClass("is-collapsed") &&
            $(this).has("h1, h2, h3, h4, h5, h6")
          ) {
            let hSize = $(this)
              .children()
              .first()
              .prop("tagName")
              .toLowerCase()
              .replace("h", "");
            console.log(hSize + " <? " + lastHeaderSize);
            if (hSize < lastHeaderSize) {
              setHeaderCollapse($(this), false);
              lastHeaderSize = hSize;
            }
          }
        });
    } else {
      if (!$(header).hasClass("is-collapsed"))
        $(header).toggleClass("is-collapsed");
      $(header).nextUntil(selector).hide();
    }
  }

  $(".heading-collapse-indicator").on("click", function () {
    var isCollapsed = $(this).parent().parent().hasClass("is-collapsed");
    setHeaderCollapse($(this).parent().parent(), !isCollapsed);
  });

  // open outline header when an internal link that points to that header is clicked
  $(".internal-link").on("click", function () {
    let target = $(this).attr("href");

    if (target.startsWith("#")) {
      let header = $(target);

      setHeaderCollapse($(header).parent(), false);
    }
  });

  // Make button with id="#save-to-pdf" save the current page to a PDF file
  $("#save-pdf").on("click", function () {
    window.print();
  });

  // MAKE OUTLINE COLLAPSIBLE
  // if "outline-header" is clicked, toggle the display of every div until the next heading of the same or lower level

  var outline_width = 0;

  $(".outline-item-contents > .collapse-icon").on("click", function () {
    var isCollapsed = $(this).parent().parent().hasClass("is-collapsed");

    $(this).parent().parent().toggleClass("is-collapsed");

    if (isCollapsed) {
      $(this).parent().next().slideDown(120);
    } else {
      $(this).parent().next().slideUp(120);
    }
  });

  // hide the control button if the header has no children
  $(".outline-item-children:not(:has(*))").each(function () {
    $(this).parent().find(".collapse-icon").hide();
  });

  // Fix checkboxed toggling .is-checked
  // $(".task-list-item-checkbox").on("click", function () {
  //   $(this).parent().toggleClass("is-checked");
  //   $(this)
  //     .parent()
  //     .attr("data-task", $(this).parent().hasClass("is-checked") ? "x" : " ");
  // });

  // $(`input[type="checkbox"]`).each(function () {
  //   $(this).prop("checked", $(this).hasClass("is-checked"));
  // });

  $(".kanban-plugin__item.is-complete").each(function () {
    $(this).find('input[type="checkbox"]').prop("checked", true);
  });

  // make code snippet block copy button copy the code to the clipboard
  $(".copy-code-button").on("click", function () {
    let code = $(this).parent().find("code").text();
    navigator.clipboard.writeText(code);
  });

  let focusedNode = null;

  // make canvas nodes selectable
  $(".canvas-node-content-blocker").on("click", function () {
    console.log("clicked");
    $(this).parent().parent().toggleClass("is-focused");
    $(this).hide();

    if (focusedNode) {
      focusedNode.removeClass("is-focused");
      $(focusedNode).find(".canvas-node-content-blocker").show();
    }

    focusedNode = $(this).parent().parent();
  });

  // make canvas node deselect when clicking outside
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".canvas-node").length) {
      $(".canvas-node").removeClass("is-focused");
      $(".canvas-node-content-blocker").show();
    }
  });

  // unhide html elements that are hidden by default
  // $("html").css("visibility", "visible");
  // $("html").css("background-color", "var(--background-primary)");

  startTime();

  function startTime() {
    var today = new Date();
    var y = today.getFullYear();
    var M = today.getMonth() + 1;
    var d = today.getDate();
    var w = today.getDay();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var week = [
      "星期天",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    var month = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ];
    // add a zero in front of numbers<10
    h = checkTime(h);
    M = checkTime(M);
    d = checkTime(d);
    m = checkTime(m);
    s = checkTime(s);
    var str =
      y +
      "年" +
      M +
      "月" +
      d +
      "日" +
      " " +
      h +
      "时" +
      m +
      "分" +
      s +
      "秒" +
      " " +
      week[w];
    var DigitalClock = `<div class="DPDC" cityid="9701" lang="en" id="DigitalClock" ampm="false" nightsign="true" sun="false"><div class="DPDCt"><span class="DPDCth">${h}</span><span class="DPDCtm">${m}</span><span class="DPDCts">${s}</span></div><div class="DPDCd"><span class="DPDCdt">${M}月${d}  ${week[w]}</span></div></div>`;
    $("#Digital-Clock").html(DigitalClock);
    $("#home_date").html(str);
    $("#day").html(d);
    $("#weekday").html(week[w]);
    $("#month").html(month[M - 1]);

    t = setTimeout(startTime, 1000);

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
  }

  function locationFile() {
    //location
    var pathname = location.pathname;
    var filename = pathname.split("/").pop();
    fileName2 = filename.substring(0, filename.lastIndexOf("."));
    $('title').text(decodeURIComponent(fileName2) + "--Obsidian online publish");
    if (fileName2) {
      var decodedString = decodeURIComponent(fileName2);
      console.log('.nav-file-title[data-path="' + decodedString + '.md"]');
      var currentNode = $(
        '#sidebar.sidebar-left [data-path$="' + decodedString + '.md"]'
      );
      if (currentNode.length) {
        currentNode.addClass("is-active");
        currentNode.parents(".nav-folder-children").show();
        currentNode.parents(".nav-folder").addClass("is-collapsed");
        $("#sidebar.sidebar-left .nav-files-container").animate({
            scrollTop: currentNode.offset().top - 250,
          },
          600
        );
      }
    }
  }
  $.get(
    "/Blue-topaz-example-online/asset/html/navigator.html",
    function (data) {
      $("#sidebar.sidebar-left").before(data);

      $("#btn-file").on("click", function () {
        var winWide = window.screen.width;
        if (winWide <= 900) {
          $("#sidebar.sidebar-right").hide(300);
        }
      });

      $("#location-file").on("click", function () {
        locationFile();
      });
    }
  );

  $.get(
    "/Blue-topaz-example-online/asset/html/file_explore.html",
    function (data) {
      $("#sidebar.sidebar-left").append(data);

      $(".nav-files-container .nav-folder-title").on("click", function () {
        var isCollapsed = $(this).parent().hasClass("is-collapsed");

        if (isCollapsed) {
          $(this).parent().toggleClass("is-collapsed");
        }

        $(this)
          .parent()
          .find(".nav-folder-children")
          .slideToggle(
            (duration = 100),
            (complete = function () {
              if (!isCollapsed) {
                $(this).parent().toggleClass("is-collapsed");
              }
            })
          );
      });
      $(".nav-folder-children .nav-file-title").on("click", function () {
        var path = $(this).data("path");
        let fileName = path.substring(0, path.lastIndexOf("."));
        window.location.href =
          "/Blue-topaz-example-online/" + fileName + ".html";
      });

      $("#search-button").on("click", function () {
        $("#search-button").addClass('is-active');
        $("body").addClass("search-active");
        $('.pagefind-ui__search-input').focus();
      });

  locationFile();

  new PagefindUI({ element: "#search",base:"Blue-topaz-example-online" });
});

document.addEventListener('click', (e)=>{
  const searchEl = document.querySelector('#search')
  const searchButtonEl =  document.querySelector("#search-button")
  if(!searchEl.contains(e.target) && !searchButtonEl.contains(e.target)){
    $("body").removeClass("search-active")
      $("#search-button").removeClass('is-active');
  }
})

document.querySelector("body").addEventListener('keyup', (e)=>{
  if(e.code==="Escape"){
      document.body.classList.remove("search-active")
  }
})

var statusbar = `<div class="status-bar" style="z-index: 9999">
<div
  class="cmdr status-bar-item clickable-icon"
  aria-label-position="top"
  aria-label="打开主页"
  style="color: inherit" onclick="window.location.href='/Blue-topaz-example-online/'"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="svg-icon lucide-home"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
</div>
<div
  class="status-bar-item plugin-editor-status mod-clickable"
  style="display: none"
  aria-label="阅读视图"
  aria-label-position="top"
>
  <span class="status-bar-item-icon"></span>
</div>
<div class="status-bar-item plugin-word-count">
  <span id="status-word" class="status-bar-item-segment">2839 个词</span
  ><span id="status-words" class="status-bar-item-segment">3389 个字符</span>
</div>
<div class="status-bar-item">
<span class="status-bar-item-segment">build by Cuman</span
>
</div>
</div>`;
$("#sidebar.sidebar-right").after(statusbar);

var outline = `<button id="bullet-list" class="blank  button-inline"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon "><path d="M3 3H21C22.1046 3 23 3.89543 23 5V19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V5C1 3.89543 1.89543 3 3 3Z"></path><path d="M14 4V20"></path><path d="M20 7H17"></path><path d="M20 10H17"></path><path d="M20 13H17"></path></svg></button>`;
$(".markdown-reading-view").prepend(outline);

// right sidebar
$("#bullet-list").on("click", function () {
  $("#sidebar.sidebar-right").animate({
    width: "toggle"
  });
  var winWide = window.screen.width;
  if (winWide <= 900) {
    $("#sidebar.sidebar-left").hide(300);
  }
});

// moc
$(".markdown-reading-view button.main-bar").each(function (index) {
  $(this)
    .eq(0)
    .on("click", function () {
      window.location.href = "/Blue-topaz-example-online/";
    });
  $(this)
    .eq(1)
    .on("click", function () {
      window.history.back(-1);
    });
  $(this)
    .eq(2)
    .on("click", function () {
      window.history.forward();
    });
  $(this)
    .eq(3)
    .on("click", function () {
      window.location.reload();
    });
});
$("body .markdown-reading-view>.markdown-preview-view").on("touchstart", function (e) {
  if ($("#sidebar.sidebar-right").is(":visible")) {
    $("#sidebar.sidebar-right").hide(300);
  }
  if ($("#sidebar.sidebar-left").is(":visible")) {
    $("#sidebar.sidebar-left").hide(300);
  }
});

//add markdown
$(".markdown-reading-view").attr("data-type", "markdown");

//word count

let data = $(".markdown-reading-view").text()
CountChineseCharacters(data);

function CountChineseCharacters(data) {
  Words = data;
  var W = new Object();
  var Result = new Array();
  var iNumwords = 0;
  var sNumwords = 0;
  var sTotal = 0; //双字节字符;
  var iTotal = 0; //中文字符；
  var eTotal = 0; //Ｅ文字符
  var otherTotal = 0;
  var bTotal = 0;
  var inum = 0;

  for (i = 0; i < Words.length; i++) {
    var c = Words.charAt(i);
    if (c.match(/[\u4e00-\u9fa5]/)) {
      if (isNaN(W[c])) {
        iNumwords++;
        W[c] = 1;
      }
      iTotal++;
    }
  }

  for (i = 0; i < Words.length; i++) {
    var c = Words.charAt(i);
    if (c.match(/[^\x00-\xff]/)) {
      if (isNaN(W[c])) {
        sNumwords++;

      }
      sTotal++;
    } else {
      eTotal++;
    }
    if (c.match(/[0-9]/)) {
      inum++;
    }
  }
  //alert(iTotal);
  // $('zhongwen').innerText = iTotal;
  // $('zbiaodian').innerText = sTotal - iTotal;
  // $('zhongwenbiaodian').innerText = sTotal;
  // $('yingwen').innerText = eTotal;
  // $('shuzi').innerText = inum;
  $("#status-word").text(sTotal + '个词');
  $("#status-words").text.innerHTML = iTotal * 2 + (sTotal - iTotal) * 2 + eTotal + "字符";
}




//colorfull clock
let colorclock = `<div id="clock"class="progress-clock" style="transform: scale(0.75);"><button class="progress-clock__time-date"data-group="d"type="button"><small data-unit="w">Sunday</small><br><span data-unit="mo">January</span><span data-unit="d">1</span></button><button class="progress-clock__time-digit"data-unit="h"data-group="h"type="button">12</button><span class="progress-clock__time-colon">:</span><button class="progress-clock__time-digit"data-unit="m"data-group="m"type="button">00</button><span class="progress-clock__time-colon">:</span><button class="progress-clock__time-digit"data-unit="s"data-group="s"type="button">00</button><span class="progress-clock__time-ampm"data-unit="ap">AM</span><svg class="progress-clock__rings"width="256"height="256"viewBox="0 0 256 256"><defs><linearGradient id="pc-red"x1="1"y1="0.5"x2="0"y2="0.5"><stop offset="0%"stop-color="hsl(343,90%,55%)"/><stop offset="100%"stop-color="hsl(323,90%,55%)"/></linearGradient><linearGradient id="pc-yellow"x1="1"y1="0.5"x2="0"y2="0.5"><stop offset="0%"stop-color="hsl(43,90%,55%)"/><stop offset="100%"stop-color="hsl(23,90%,55%)"/></linearGradient><linearGradient id="pc-blue"x1="1"y1="0.5"x2="0"y2="0.5"><stop offset="0%"stop-color="hsl(223,90%,55%)"/><stop offset="100%"stop-color="hsl(203,90%,55%)"/></linearGradient><linearGradient id="pc-purple"x1="1"y1="0.5"x2="0"y2="0.5"><stop offset="0%"stop-color="hsl(283,90%,55%)"/><stop offset="100%"stop-color="hsl(263,90%,55%)"/></linearGradient></defs><!--Days of Month--><g data-units="d"><circle class="progress-clock__ring"cx="128"cy="128"r="74"fill="none"opacity="0.1"stroke="url(#pc-red)"stroke-width="12"/><circle class="progress-clock__ring-fill"data-ring="mo"cx="128"cy="128"r="74"fill="none"stroke="url(#pc-red)"stroke-width="12"stroke-dasharray="465 465"stroke-dashoffset="465"stroke-linecap="round"transform="rotate(-90,128,128)"/></g><!--Hours of Day--><g data-units="h"><circle class="progress-clock__ring"cx="128"cy="128"r="90"fill="none"opacity="0.1"stroke="url(#pc-yellow)"stroke-width="12"/><circle class="progress-clock__ring-fill"data-ring="d"cx="128"cy="128"r="90"fill="none"stroke="url(#pc-yellow)"stroke-width="12"stroke-dasharray="565.5 565.5"stroke-dashoffset="565.5"stroke-linecap="round"transform="rotate(-90,128,128)"/></g><!--Minutes of Hour--><g data-units="m"><circle class="progress-clock__ring"cx="128"cy="128"r="106"fill="none"opacity="0.1"stroke="url(#pc-blue)"stroke-width="12"/><circle class="progress-clock__ring-fill"data-ring="h"cx="128"cy="128"r="106"fill="none"stroke="url(#pc-blue)"stroke-width="12"stroke-dasharray="666 666"stroke-dashoffset="666"stroke-linecap="round"transform="rotate(-90,128,128)"/></g><!--Seconds of Minute--><g data-units="s"><circle class="progress-clock__ring"cx="128"cy="128"r="122"fill="none"opacity="0.1"stroke="url(#pc-purple)"stroke-width="12"/><circle class="progress-clock__ring-fill"data-ring="m"cx="128"cy="128"r="122"fill="none"stroke="url(#pc-purple)"stroke-width="12"stroke-dasharray="766.5 766.5"stroke-dashoffset="766.5"stroke-linecap="round"transform="rotate(-90,128,128)"/></g></svg></div><iframe scrolling="no" src="https://tianqiapi.com/api.php?style=ta&skin=pear&fontsize=13&align=&paddingtop=2&paddingleft=45&color=707271" frameborder="0" width="350" height="24" allowtransparency="true"></iframe>`

class ProgressClock {
  constructor(qs) {
    this.el = document.querySelector(qs);
    this.time = 0;
    this.updateTimeout = null;
    this.ringTimeouts = [];
    this.update();
  }
  getDayOfWeek(day) {
    switch (day) {
      case 1:
        return "周一";
      case 2:
        return "周二";
      case 3:
        return "周三";
      case 4:
        return "周四";
      case 5:
        return "周五";
      case 6:
        return "周六";
      default:
        return "周日";
    }
  }
  getMonthInfo(mo, yr) {
    switch (mo) {
      case 1:
        return {
          name: "二月", days: yr % 4 === 0 ? 29 : 28
        };
      case 2:
        return {
          name: "三月", days: 31
        };
      case 3:
        return {
          name: "四月", days: 30
        };
      case 4:
        return {
          name: "五月", days: 31
        };
      case 5:
        return {
          name: "六月", days: 30
        };
      case 6:
        return {
          name: "七月", days: 31
        };
      case 7:
        return {
          name: "八月", days: 31
        };
      case 8:
        return {
          name: "九月", days: 30
        };
      case 9:
        return {
          name: "十月", days: 31
        };
      case 10:
        return {
          name: "十一月", days: 30
        };
      case 11:
        return {
          name: "十二月", days: 31
        };
      default:
        return {
          name: "一月", days: 31
        };
    }
  }
  update() {
    this.time = new Date();

    if (this.el) {
      // date and time
      const dayOfWeek = this.time.getDay();
      const year = this.time.getFullYear();
      const month = this.time.getMonth();
      const day = this.time.getDate();
      const hr = this.time.getHours();
      const min = this.time.getMinutes();
      const sec = this.time.getSeconds();
      const dayOfWeekName = this.getDayOfWeek(dayOfWeek);
      const monthInfo = this.getMonthInfo(month, year);
      const m_progress = sec / 60;
      const h_progress = (min + m_progress) / 60;
      const d_progress = (hr + h_progress) / 24;
      const mo_progress = ((day - 1) + d_progress) / monthInfo.days;
      const units = [{
          label: "w",
          value: dayOfWeekName
        },
        {
          label: "mo",
          value: monthInfo.name,
          progress: mo_progress
        },
        {
          label: "d",
          value: day,
          progress: d_progress
        },
        {
          label: "h",
          value: hr > 12 ? hr - 12 : hr,
          progress: h_progress
        },
        {
          label: "m",
          value: min < 10 ? "0" + min : min,
          progress: m_progress
        },
        {
          label: "s",
          value: sec < 10 ? "0" + sec : sec
        },
        {
          label: "ap",
          value: hr > 12 ? "下午" : "上午"
        }
      ];

      // flush out the timeouts
      this.ringTimeouts.forEach(t => {
        clearTimeout(t);
      });
      this.ringTimeouts = [];

      // update the display
      units.forEach(u => {
        // rings
        const ring = this.el.querySelector(`[data-ring="${u.label}"]`);

        if (ring) {
          const strokeDashArray = ring.getAttribute("stroke-dasharray");
          const fill360 = "progress-clock__ring-fill--360";

          if (strokeDashArray) {
            // calculate the stroke
            const circumference = +strokeDashArray.split(" ")[0];
            const strokeDashOffsetPct = 1 - u.progress;

            ring.setAttribute(
              "stroke-dashoffset",
              strokeDashOffsetPct * circumference
            );

            // add the fade-out transition, then remove it
            if (strokeDashOffsetPct === 1) {
              ring.classList.add(fill360);

              this.ringTimeouts.push(
                setTimeout(() => {
                  ring.classList.remove(fill360);
                }, 600)
              );
            }
          }
        }

        // digits
        const unit = this.el.querySelector(`[data-unit="${u.label}"]`);

        if (unit)
          unit.innerText = u.value;
      });
    }

    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(this.update.bind(this), 1e3);
  }
}


var ua = navigator.userAgent.toLowerCase();

if (!(/mobile|android|iphone|ipad|phone/i.test(ua))) {
  $("#sidebar.sidebar-right").prepend(colorclock);
  const clock = new ProgressClock("#sidebar #clock");
}

 

});