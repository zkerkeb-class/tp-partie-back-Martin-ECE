
import express from 'express';
import pokemon from './schema/pokemon.js';
import cors from 'cors';
import path from "path";

import './connect.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use("/assets", express.static("assets"));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/pokemons', async (req, res) => {
    try {
        const pokemons = await pokemon.find({});
        res.json(pokemons);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/pokemons/:id', async (req, res) => {
    try {
        const poke = await pokemon.findOne({ id: req.params.id });
        if (poke) {
            res.json(poke);
        } else {
            res.status(404).send('Pokemon not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.post("/pokemons", async (req, res) => {
  try {
    const lastPokemon = await pokemon.findOne().sort({ id: -1 });
    const nextId = lastPokemon ? lastPokemon.id + 1 : 1;

    const newPokemon = new pokemon({ ...req.body, id: nextId });
    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});