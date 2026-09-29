import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PeliculaAttributes {
  id: number;
  titulo: string;
  genero: string;
  duracionMinutos: number;
  clasificacion: string;
  sinopsis: string;
  posterUrl: string | null;
  trailerUrl: string | null;
  esProximoEstreno: boolean;
}

interface PeliculaCreationAttributes
  extends Optional<
    PeliculaAttributes,
    "id" | "posterUrl" | "trailerUrl" | "esProximoEstreno"
  > {}

class Pelicula
  extends Model<PeliculaAttributes, PeliculaCreationAttributes>
  implements PeliculaAttributes
{
  public id!: number;
  public titulo!: string;
  public genero!: string;
  public duracionMinutos!: number;
  public clasificacion!: string;
  public sinopsis!: string;
  public posterUrl!: string | null;
  public trailerUrl!: string | null;
  public esProximoEstreno!: boolean;
}

Pelicula.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "duracion_minutos",
    },
    clasificacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sinopsis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    posterUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "poster_url",
    },
    trailerUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "trailer_url",
    },
    esProximoEstreno: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "es_proximo_estreno",
    },
  },
  {
    sequelize,
    tableName: "peliculas",
    modelName: "Pelicula",
    timestamps: true,
  }
);

export default Pelicula;