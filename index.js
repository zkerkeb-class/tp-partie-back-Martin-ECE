
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

// app.get("/pokemons", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const total = await pokemon.countDocuments();
//     const pokemons = await pokemon.find({})
//       .skip(skip)
//       .limit(limit)
//       .sort({ id: 1 });

//     res.json({
//       page,
//       totalPages: Math.ceil(total / limit),
//       totalItems: total,
//       items: pokemons,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Erreur serveur");
//   }
// });

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

app.put("/pokemons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Met à jour le Pokémon correspondant à l'id
    const updated = await pokemon.findOneAndUpdate(
      { id: Number(id) },  // id du Pokémon
      updateData,
      { new: true }        // retourne le Pokémon mis à jour
    );

    if (updated) {
      res.json(updated);
    } else {
      res.status(404).send("Pokémon non trouvé");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la mise à jour du Pokémon");
  }
});

app.delete("/pokemons/:id", async (req, res) => {
  try {
    const deletedPokemon = await pokemon.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedPokemon) {
      return res.status(404).send("Pokémon introuvable");
    }

    res.json({ message: "Pokémon supprimé avec succès" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});