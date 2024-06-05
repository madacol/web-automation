javascript:(async function(){
  function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  const getBase64FromUrl = async (url) => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      }
    });
  }

  document.querySelectorAll('img').forEach(async img => {
    let base64;
    try {
      base64 = getBase64Image(img);
    } catch (error) {
      base64 = await getBase64FromUrl(img.src);
    };
    const markdown = `![${img.alt}](${base64})`;
    console.log(markdown, img);
  })
})();