import { join } from 'path'; //in Node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration], //hace conversiones y mapeos
      validationSchema: JoiValidationSchema, //hace conversiones y mapeos // trabajan en conjunto //prioriza sus validaciones
    }), // debe estar en el inicio
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRoot(process.env.MONGODB), //connection to database
    PokemonModule,
    CommonModule,
    SeedModule,
  ],
})
export class AppModule {}
