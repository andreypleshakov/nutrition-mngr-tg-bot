import { Request, Response } from "express";
import { getAllProducts } from "./productsService";

export async function getProducts(req: Request, res: Response) {
  const tgId = parseInt(req.params.tgId, 10);
  const productList = await getAllProducts(tgId);
  res.json(productList);
}
