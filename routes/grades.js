const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
global.fileName = 'grades.json';

/* Crie um endpoint para criar uma grade. Este endpoint deverá receber como 
parâmetros os campos student, subject, type e value conforme descritos acima. 
Essa grade deverá ser salva no arquivo json grades.json, e deverá ter um id 
único associado. No campo timestamp deverá ser salvo a data e hora do momento 
da inserção. O endpoint deverá retornar o objeto da grade que foi criada. A API 
deverá garantir o incremento automático desse identificador, de forma que ele não 
se repita entre os registros. Dentro do arquivo grades.json que foi fornecido para 
utilização no desafio, o campo nextId já está com um valor definido. Após a inserção 
é preciso que esse nextId seja incrementado e salvo no próprio arquivo, de forma que 
na próxima inserção ele possa ser utilizado. */

router.post('/', async (req, res) => {
  let info = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let date = new Date();
    let studentGrade = {
      student: info.student,
      subject: info.subject,
      type: info.type,
      value: info.value,
      timestamp: date,
    };
    let json = JSON.parse(data);
    studentGrade = {
      id: json.nextId++,
      ...studentGrade,
    };
    json.grades.push(studentGrade);
    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(`POST /grades - ${JSON.stringify(studentGrade)}`);
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`POST /grades - ${err.message}`);
  }
});

/* Crie um endpoint para atualizar uma grade. Esse endpoint deverá receber como 
parâmetros o id da grade a ser alterada e os campos student, subject, type e 
value. O endpoint deverá validar se a grade informada existe, caso não exista 
deverá retornar um erro. Caso exista, o endpoint deverá atualizar as informações
recebidas por parâmetros no registro, e realizar sua atualização com os novos 
dados alterados no arquivo grades.json. */

router.put('/', async (req, res) => {
  let info = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let oldIndex = json.grades.findIndex((grade) => grade.id === info.id);
    if (oldIndex) {
      json.grades[oldIndex].student = info.student;
      json.grades[oldIndex].subject = info.subject;
      json.grades[oldIndex].type = info.type;
      json.grades[oldIndex].value = info.value;
      await fs.writeFile(global.fileName, JSON.stringify(json));
      res.end();
      logger.info(`PUT /grades - ${JSON.stringify(info)}`);
    }
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`PUT /grades - ${err.message}`);
  }
});

//Crie um endpoint para excluir uma grade. Esse endpoint deverá receber como
//parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.

router.delete('/:id', async (req, res) => {
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let undeletedGrade = json.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );
    json.grades = undeletedGrade;
    await fs.writeFile(global.fileName, JSON.stringify(json));
    res.end();
    logger.info(
      `DELETE /grades/:id - Grade ${parseInt(
        req.params.id
      )} removed from memory.`
    );
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`DELETE /grades/:id - ${err.message}`);
  }
});

/* Crie um endpoint para consultar uma grade em específico. Esse endpoint deverá
 receber como parâmetro o id da grade e retornar suas informações. */

router.get('/:id', async (req, res) => {
  let reqId = parseInt(req.params.id);
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let searchedGrade = json.grades.filter((grade) => reqId === grade.id);
    if (searchedGrade) {
      res.send(searchedGrade);
      logger.info(`GET /grades/:id - ${JSON.stringify(searchedGrade)}`);
    }
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`GET /grades/:id - ${err.message}`);
  }
});

/*Crie um endpoint para consultar a nota total de um aluno em uma disciplina. O 
endpoint deverá receber como parâmetro o student e o subject, e realizar a soma 
de todas as notas de atividades correspondentes àquele subject, para aquele student. 
O endpoint deverá retornar a soma da propriedade value dos registros encontrados.
 */

router.post('/soma', async (req, res) => {
  let info = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let aluno = json.grades.filter((grade) => grade.student === info.student);
    let materia = aluno.filter((student) => student.subject === info.subject);
    let somaNotas = materia.reduce((acc, curr) => acc + curr.value, 0);
    res.send(
      `A soma das notas de ${info.student} na matéria ${info.subject} é de ${somaNotas}`
    );
    logger.info(
      `POST /grades/soma - A soma das notas de ${info.student} na matéria ${info.subject} é de ${somaNotas}`
    );
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`POST /grades/soma - ${err.message}`);
  }
});

/*Crie um endpoint para consultar a média das grades de determinado subject e 
type. O endpoint deverá receber como parâmetro um subject e um type, e retornar 
a média. A média é calculada somando o registro value de todos os registros que 
possuem o subject e type informados, dividindo pelo total de registros que 
possuem este mesmo subject e type. */

router.post('/media', async (req, res) => {
  let info = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let materia = json.grades.filter((grade) => grade.subject === info.subject);
    let tipo = materia.filter((materia) => materia.type === info.type);
    let mediaNotas =
      tipo.reduce((acc, curr) => acc + curr.value, 0) / tipo.length;
    res.send(
      `A media das notas na matéria ${info.subject}  nas atividades ${info.type} é de ${mediaNotas}`
    );
    logger.info(
      `POST /grades/media - A media das notas na matéria ${info.subject}  nas atividades ${info.type} é de ${mediaNotas}`
    );
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`POST /grades/media - ${err.message}`);
  }
});

/*Crie um endpoint para retornar as três melhores grades de acordo com determinado 
subject e type. O endpoint deve receber como parâmetro um subject e um type, e 
retornar um array com os três registros de maior value daquele subject e type. A
ordem deve ser do maior para o menor. */

router.post('/top', async (req, res) => {
  let info = req.body;
  try {
    let data = await fs.readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let materia = json.grades.filter((grade) => grade.subject === info.subject);
    let tipo = materia.filter((materia) => materia.type === info.type);
    tipo.sort((a, b) => b.value - a.value);
    tipo = tipo.slice(0, 3);
    res.send(JSON.stringify(tipo));
    logger.info(
      `POST /grades/top - As três maiores notas na matéria ${
        info.subject
      } na atividade ${info.type} são ${JSON.stringify(tipo)}`
    );
  } catch (err) {
    res.status(400).send({ Error: err.message });
    logger.error(`POST /grades/top - ${err.message}`);
  }
});

module.exports = router;
