import express from 'express';
import pokemon from './schema/pokemon.js';
import cors from 'cors';
import path from "path";

import './connect.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use("/assets", express.static("assets"));

// ✅ Route test
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// ✅ GET /pokemons avec pagination et recherche globale
app.get('/pokemons', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Filtre recherche sur français ou anglais
    const filter = search
      ? {
          $or: [
            { "name.french": { $regex: search, $options: "i" } },
            { "name.english": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalPokemons = await pokemon.countDocuments(filter);

    const pokemons = await pokemon
      .find(filter)
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: pokemons,
      currentPage: page,
      totalPages: Math.ceil(totalPokemons / limit),
      totalPokemons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// ✅ GET /pokemons/all (tous les Pokémon)
app.get("/pokemons/all", async (req, res) => {
  try {
    const pokemons = await pokemon.find({}).sort({ id: 1 });
    res.json(pokemons);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ✅ GET /pokemons/:id
app.get('/pokemons/:id', async (req, res) => {
  try {
    const poke = await pokemon.findOne({ id: req.params.id });
    if (poke) res.json(poke);
    else res.status(404).send('Pokemon not found');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ✅ POST /pokemons (ajout)
app.post("/pokemons", async (req, res) => {
  try {
    const lastPokemon = await pokemon.findOne().sort({ id: -1 });
    const nextId = lastPokemon ? lastPokemon.id + 1 : 1;

    const newPokemon = new pokemon({
      ...req.body,
      id: nextId,
    });

    await newPokemon.save();
    res.status(201).json(newPokemon);
  } catch (error) {
    console.error("ERREUR AJOUT :", error.message);
    res.status(400).send(error.message);
  }
});

// ✅ PUT /pokemons/:id (update)
app.put("/pokemons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await pokemon.findOneAndUpdate(
      { id: Number(id) },
      updateData,
      { new: true }
    );

    if (updated) res.json(updated);
    else res.status(404).send("Pokémon non trouvé");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la mise à jour du Pokémon");
  }
});

// ✅ DELETE /pokemons/:id
app.delete("/pokemons/:id", async (req, res) => {
  try {
    const deletedPokemon = await pokemon.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedPokemon) return res.status(404).send("Pokémon introuvable");

    res.json({ message: "Pokémon supprimé avec succès" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ✅ Serveur
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
