import sequelize from "../config/database";
import { CompraProducto, Producto } from "../models";
import { AppError } from "../utils/AppError";

export interface CrearProductoDTO {
    nombre: string;
    precio: number;
    stock: number;
    categoria: string;
}

export interface ActualizarProductoDTO {
    nombre?: string;
    precio?: number;
    stock?: number;
    categoria?: string;
}

export async function obtenerProductos() {
    return Producto.findAll({
        order: [["id", "ASC"]],
    });
}

export async function obtenerProductoPorId(id: number) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
        throw new AppError("Producto no encontrado", 404);
    }

    return producto;
}

export async function crearProducto(datos: CrearProductoDTO) {
    return Producto.create({
        nombre: datos.nombre.trim(),
        precio: datos.precio,
        stock: datos.stock,
        categoria: datos.categoria.trim(),
    });
}

export async function actualizarProducto(
    id: number,
    datos: ActualizarProductoDTO
    ) {
    const producto = await Producto.findByPk(id);

    if (!producto) {
        throw new AppError("Producto no encontrado", 404);
    }

    const datosLimpios: ActualizarProductoDTO = {};

    if (datos.nombre !== undefined) {
        datosLimpios.nombre = datos.nombre.trim();
    }
    if (datos.categoria !== undefined) {
        datosLimpios.categoria = datos.categoria.trim();
    }
    if (datos.precio !== undefined) {
        datosLimpios.precio = datos.precio;
    }
    if (datos.stock !== undefined) {
        datosLimpios.stock = datos.stock;
    }

    await producto.update(datosLimpios);

    return producto;
}

export async function eliminarProducto(id: number): Promise<void> {
    return sequelize.transaction(async (t) => {
        const producto = await Producto.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
    });

    if (!producto) {
        throw new AppError("Producto no encontrado", 404);
        }

        const cantidadVentas = await CompraProducto.count({
        where: { productoId: id },
        transaction: t,
        });

        if (cantidadVentas > 0) {
        throw new AppError(
            "No se puede eliminar el producto porque tiene compras asociadas",
            409
        );
        }

        await producto.destroy({ transaction: t });
    });
}