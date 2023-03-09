import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonData } from 'src/seed/interfaces/pokemon-data.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name) // añadir el decorador para poder inyectar //Note: name es el name que se está extendiendo desde mongo
    private readonly pokemonModel: Model<Pokemon>, // Esto por si solo no es un provider, no se puede inyectar solo así
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const newPokemon = await this.pokemonModel.create(createPokemonDto);
      return newPokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    return this.pokemonModel
      .find()
      .limit(this.defaultLimit || 10)
      .skip(paginationDto.offset)
      .sort({ no: 'asc' })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term });
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${term}" not found`,
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (!deletedCount) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }

    return;
  }

  async fillPokemonsWithSeedData(newData: PokemonData[]) {
    await this.pokemonModel.deleteMany({}); // esto significa borrar toda la data, utilizar solo en casos especīficos, por ejemplo, donde solo exista data seed
    // const savedData = newData.map((item) => {
    //   return this.create(item);
    // });
    // const currentData = await Promise.all(savedData);

    const savedData = await this.pokemonModel.insertMany(newData); // solo utilizar cuando se añade un seed

    return savedData;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log('error-updatePokemonService:', error);
    throw new InternalServerErrorException(
      "Can't update pokemon - Check server logs",
    );
  }
}
