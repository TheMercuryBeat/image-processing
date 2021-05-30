import express from 'express';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.json({message: 'heyy'});
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
})