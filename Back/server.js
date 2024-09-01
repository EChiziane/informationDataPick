const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DIRECTORY_PATH = path.join(__dirname, 'src');
const FILE_PATH = path.join(DIRECTORY_PATH, 'informacao.txt');

app.use(cors());
app.use(express.json());

// Cria o diretório 'src' se não existir
if (!fs.existsSync(DIRECTORY_PATH)) {
  fs.mkdirSync(DIRECTORY_PATH, {recursive: true});
}

// Cria o ficheiro 'informacao.txt' se não existir
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, '[]', 'utf8'); // Inicializa o ficheiro com um array vazio
}

// Endpoint para ler dados do ficheiro
app.get('/api/informacao', (req, res) => {
  if (fs.existsSync(FILE_PATH)) {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler o ficheiro:', err);
        return res.status(500).send('Erro ao ler o ficheiro.');
      }

      try {
        // Converte o conteúdo do ficheiro para um array JSON
        const informacoes = JSON.parse(data);
        res.json(informacoes);
      } catch (err) {
        console.error('Erro ao processar o JSON:', err);
        res.status(500).send('Erro ao processar o JSON.');
      }
    });
  } else {
    res.json([]); // Retorna uma lista vazia se o ficheiro não existir
  }
});

// Endpoint para adicionar nova informação ao ficheiro
app.post('/api/informacao', (req, res) => {
  const {data, descricao} = req.body;

  if (!data || !descricao) {
    return res.status(400).json({error: 'Dados inválidos.'});
  }

  let fileData = [];
  if (fs.existsSync(FILE_PATH)) {
    const existingData = fs.readFileSync(FILE_PATH, 'utf-8');
    try {
      fileData = existingData.trim() === '' ? [] : JSON.parse(existingData);
    } catch (err) {
      return res.status(500).json({error: 'Erro ao processar JSON.'});
    }
  }

  const newInfo = {data, descricao};
  fileData.push(newInfo);
  fs.writeFileSync(FILE_PATH, JSON.stringify(fileData, null, 2));

  // Retorna o novo dado gravado
  res.status(200).json(newInfo);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
