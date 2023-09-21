const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const pe = btn.closest("article");
  const url = `/admin/product/${prodId}`;
  fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "Application/json",
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      pe.parentNode.removeChild(pe);
    })
    .catch((err) => {
      console.log(err);
    });
};
