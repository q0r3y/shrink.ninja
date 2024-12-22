function copyLink() {
  let $shortLink = document.getElementById("link").innerText;
  if ($shortLink.length <= 12) $shortLink = `https://${$shortLink}`;
  navigator.clipboard.writeText($shortLink);

  function runCopyAnimation() {
    const $copy = document.getElementById("copy");
    $copy.style.filter = "invert(100%)";
    const $clone = $copy.cloneNode(true);
    $copy.parentNode.replaceChild($clone, $copy);
    $clone.classList.add("a");
  }

  runCopyAnimation();
}

function transferToGithub() {
  window.location.href = "https://github.com/q0r3y/shrink.ninja";
}

function setColors() {
  let darkColor = `hsl(215deg, 42%, 5%)`;
  let lightColor = `hsl(228deg, 47%, 98%)`;
  if (window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      window.snColor = darkColor;
      setBgColor(darkColor);
      setTextColor(darkColor);
      setSvgColor(darkColor);
      if (window.qrCode) {
        window.qrCode.set({ foreground: darkColor });
      }
    } else {
      window.snColor = lightColor;
      setBgColor(lightColor);
      setTextColor(lightColor);
      setSvgColor(lightColor);
      if (window.qrCode) {
        window.qrCode.set({ foreground: lightColor });
      }
    }
  } else {
    window.snColor = darkColor;
    setBgColor(darkColor);
    setTextColor(darkColor);
    setSvgColor(darkColor);
    if (window.qrCode) {
      window.qrCode.set({ foreground: darkColor });
    }
  }
}

function setRandomColors() {
  const randomColor = getRandomColor();
  window.snColor = randomColor;

  setBgColor(randomColor);
  setTextColor(randomColor);
  setSvgColor(randomColor);
  if (window.qrCode) {
    window.qrCode.set({ foreground: randomColor });
  }

  function getRandomColor() {
    function getRandomNumber(limit) {
      return Math.floor(Math.random() * limit);
    }

    const h = getRandomNumber(360);
    const s = getRandomNumber(100);
    const l = getRandomNumber(100);
    return `hsl(${h}deg, ${s}%, ${l}%)`;
  }

  function setBgColor(color) {
    const $background = document.getElementById("background");
    $background.style.backgroundColor = color;
    $background.style.color = color;
  }

  function setTextColor(color) {
    const $copyText = document.getElementById("copy");
    $copyText.style.color = color;
  }

  function setSvgColor(color) {
    const $svgs = document.getElementsByClassName("svg");
    for (i = 0; i < $svgs.length; i++) {
      $svgs[i].style.fill = color;
    }
  }
}

async function requestCode() {
  const $linkText = document.getElementById("link");
  const $copyText = document.getElementById("copy");
  const $instText = document.getElementById("instructions");
  const $qrCode = document.getElementById("qrcode");
  const $shuriken = document.getElementById("shurikenSvg");
  let inputData = window.location.href.slice(window.location.origin.length + 1);
  startLoadingAnimation();

  try {
    if (inputData && isValidHttpUrl(inputData)) {
      const longUrlJson = JSON.stringify({ LongUrl: inputData });
      const newShortLink = await fetch("https://api.shrink.ninja", {
        method: "POST",
        body: longUrlJson,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (newShortLink.ok) {
        const data = await newShortLink.json();
        if (!data.errors) {
          $instText.style.display = "none";
          $copyText.style.display = "block";
          $linkText.innerText = data.ShortUrl;
          $linkText.style.display = "block";
          createQrCode(data.ShortUrl);
          $qrCode.style.display = "block";
          stopLoadingAnimation();
          return;
        }
        if (data.debug) {
          console.log(data);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }

  $instText.style.display = "block";
  stopLoadingAnimation();

  function createQrCode(website) {
    window.qrCode = new QRious({
      element: $qrCode,
      backgroundAlpha: 0,
      foreground: window.snColor,
      size: 300,
      value: `https://${website}`,
    });
  }

  function isValidHttpUrl(string) {
    try {
      let url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  function startLoadingAnimation() {
    $shuriken.classList.remove("rotates");
    $shuriken.classList.add("loading-animation");
  }

  function stopLoadingAnimation() {
    $shuriken.classList.remove("loading-animation");
    $shuriken.classList.add("rotates");
  }
}
