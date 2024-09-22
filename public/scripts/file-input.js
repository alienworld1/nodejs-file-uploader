document.getElementById('file-input').addEventListener('change', e => {
  const fileName = e.target.files[0].name;
  document.getElementById('file-name').textContent = fileName;
});
