const prisma = require('../database/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A senha secreta do seu servidor (o ideal é colocar isso no arquivo .env depois)
const JWT_SECRET = process.env.JWT_SECRET || "senha-super-secreta-fincontrol";

exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, type, date, category, isAtypical } = req.body;
    const transaction = await prisma.transaction.create({
      data: { 
        description, 
        amount, 
        type, 
        date: new Date(date), 
        category,
        isAtypical: Boolean(isAtypical)
      }
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error("ERRO DETALHADO:", error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, type, date, category } = req.body;
    const transaction = await prisma.transaction.update({
      // Como o ID no Prisma é um UUID (String), não usamos Number() aqui
      where: { id: id },
      data: { description, amount, type, date: new Date(date), category }
    });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar transação' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.transaction.delete({ where: { id: id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar transação' });
  }
};

// 1. ROTA DE CADASTRO
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  // "Embaralha" a senha antes de salvar no banco
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });
    res.status(201).json({ message: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "E-mail já cadastrado." });
  }
};

// 2. ROTA DE LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Procura o usuário pelo e-mail
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

  // Compara a senha digitada com a senha embaralhada do banco
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).json({ error: "Senha incorreta." });

  // Se tudo der certo, gera o "Crachá" (Token JWT) que dura 7 dias
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  // Devolve os dados do usuário e o token para o React
  res.json({ 
    user: { id: user.id, name: user.name, email: user.email }, 
    token 
  });
};

// 3. O MIDDLEWARE (O Segurança da Porta)
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado. Faltou mostrar o crachá (Token)." });
  }

  try {
    // O token vem no formato "Bearer 12345...", então separamos para pegar só o código
    const token = authHeader.split(" ")[1];
    
    // Verifica se o token é válido e foi assinado pela nossa senha secreta
    const verified = jwt.verify(token, JWT_SECRET);
    
    // Guarda a ID do usuário logado dentro da requisição e manda o servidor continuar
    req.userId = verified.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};