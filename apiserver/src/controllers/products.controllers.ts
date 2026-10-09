import { Request, Response } from 'express';
import pool from '../conf/dbConnections';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const isValidId = (id: string): boolean => {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE active = TRUE');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error interno al consultar la base de datos' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido. Debe ser un entero positivo.' });
        return;
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ? AND active = TRUE', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, price, stock, description, brand, img } = req.body;

    if (!name || price === undefined || stock === undefined || !description) {
        res.status(400).json({ error: 'Faltan campos obligatorios (name, price, stock, description).' });
        return;
    }
    if (typeof price !== 'number' || price <= 0) {
        res.status(400).json({ error: 'El precio debe ser un número mayor a cero.' });
        return;
    }

    try {
        const query = 'INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query<ResultSetHeader>(query, [name, price, stock, description, brand || null, img || null]);
        
        res.status(201).json({message: 'Producto creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error("Error de MySQL:", error);
        res.status(500).json({error: 'Error interno al crear el producto' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const id= req.params.id as string;
    const {name, price, stock, description, brand, img}= req.body;

    if (!isValidId(id)) {
        res.status(400).json({error: 'ID inválido.'});
        return;
    }
    if (typeof price !== 'number' || price <= 0) {
        res.status(400).json({error: 'El precio debe ser numerico y mayor a cero'});
        return;
    }

    try {
        const query = 'UPDATE products SET name=?, price=?, stock=?, description=?, brand=?, img=? WHERE id=? AND active=TRUE';
        const [result] = await pool.query<ResultSetHeader>(query, [name, price, stock, description, brand || null, img || null, id]);
        
        if (result.affectedRows === 0) {
            res.status(404).json({error: 'Producto no encontrado o inactivo.'});
            return;
        }
        res.json({message: 'Producto actualizado completamente'});
    } catch (error) {
        res.status(500).json({error: 'Error interno al actualizar'});
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const id= req.params.id as string;
    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>('UPDATE products SET active = FALSE WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado.' });
            return;
        }
        res.json({ message: 'Producto dado de baja exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const changePrice = async (req: Request, res: Response): Promise<void> => {
    const id= req.params.id as string;
    const price= Number(req.body.price);

    if (!isValidId(id)) {
        res.status(400).json({ error: 'ID inválido.' });
        return;
    }
    if (isNaN(price) || price <=0) {
        res.status(400).json({ error: 'El precio debe ser numérico y mayor a cero.' });
        return;
    }

    try {
        const [result] = await pool.query<ResultSetHeader>('UPDATE products SET price = ? WHERE id = ? AND active = TRUE', [price, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
            return;
        }
        res.json({ message: 'Precio actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno al cambiar el precio' });
    }
};