const fs = require('fs');

exports.save = (encodedFile, type) => {
  if(!encodedFile) {
    return "";
  }
  const base64Image = encodedFile.split(';base64,').pop();
  const path = './data';
  if (!fs.existsSync(path)){
    fs.mkdirSync(path, { recursive: true });
  }
  let filename = `${type}-${(new Date()).getTime()}.png`;
  const filepath = `${path}/${filename}`
  fs.writeFile(filepath, base64Image, {encoding: 'base64'}, function(error) { 
    filename = '';
   });
  return filename;
}

exports.delete = (name) => {
  const filepath = `./data/${name}`;
  fs.unlink(filepath,function(err){ return ''; }); 
}

exports.update = (encondedFile, newFile, oldFile) => {
  if(oldFile) {
    const filepath = `./data/${oldFile}`;
    fs.unlink(filepath,function(err){ }); 
  }
  return this.save(encondedFile, newFile)
}

exports.get = (name) => {
  const filepath = `./data/${name}`;
  if(!name || !fs.existsSync(filepath)) {
    return "";
  }
  return 'data:image/png;base64,' + fs.readFileSync(filepath, {encoding: 'base64'});
}