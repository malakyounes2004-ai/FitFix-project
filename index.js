import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
  res.send({ msg: "Hello from Express!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
