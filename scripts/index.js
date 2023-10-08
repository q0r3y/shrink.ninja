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
  const randomColor = getRandomColor();
  window.randomColor = randomColor;

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
      const longUrlJson = JSON.stringify({ longUrl: inputData });
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
          $linkText.innerText = data.shortUrl;
          $linkText.style.display = "block";
          createQrCode(data.shortUrl);
          $qrCode.style.display = "block";
          stopLoadingAnimation();
          return;
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
      foreground: window.randomColor,
      size: 300,
      value: `https://${website}`,
    });
  }

  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
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
