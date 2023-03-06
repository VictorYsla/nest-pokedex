import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pokemon extends Document {
  //id: string // Mongo me lo da

  @Prop({
    unique: true,
    index: true,
  })
  name: string;

  @Prop({
    unique: true,
    index: true,
  })
  no: number;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

//  Document añade las funcionalidades respectivas
// referencia a como queremos grabar en la base de datos - hacen una relación con las tablas de bases de datos
