import { Response, Request } from "express";
import Order from "../models/order";
import Resturant from "../models/resturant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

const getMyResturant = async (req: Request, res: Response) => {
  try {
    const resturant = await Resturant.findOne({ user: req.userId });
    if (!resturant) {
      return res.status(404).json({ message: "resturant not found" });
    }
    res.json(resturant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching resturant" });
  }
};

const createMyResturant = async (req: Request, res: Response) => {
  try {
    const existingResturants = await Resturant.findOne({ user: req.userId });

    if (existingResturants) {
      return res.status(409).json({ message: "User resturant already exist" });
    }

    const image = req.file as Express.Multer.File;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const restuarnt = new Resturant(req.body);
    restuarnt.imageUrl = uploadResponse.url;
    restuarnt.user = new mongoose.Types.ObjectId(req.userId);
    restuarnt.lastUpdate = new Date().toISOString();
    await restuarnt.save();

    res.status(201).send(restuarnt);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyResturant = async (req: Request, res: Response) => {
  try {
    const resturant = await Resturant.findOne({
      user: req.userId,
    });

    if (!resturant) {
      return res.status(404).json({ message: "resturant not found" });
    }

    resturant.resturantName = req.body.resturantName;
    resturant.city = req.body.city;
    resturant.country = req.body.country;
    resturant.deliveryPrice = req.body.deliveryPrice;
    resturant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    resturant.cuisines = req.body.cuisines;
    resturant.menuItems = req.body.menuItems;
    resturant.lastUpdate = new Date().toISOString();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      resturant.imageUrl = imageUrl;
    }

    await resturant.save();
    res.status(200).send(resturant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyResturantOrders = async (req: Request, res: Response) => {
  try {
    const resturant = await Resturant.findOne({ user: req.userId });
    if (!resturant) {
      return res.status(404).json({ message: "Resturant not found" });
    }

    const orders = await Order.find({ resturant: resturant._id })
      .populate("resturant")
      .populate("user");

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const resturant = await Resturant.findById(order.resturant);

    if (resturant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to update order status" });
  }
};

export default {
  getMyResturant,
  createMyResturant,
  updateMyResturant,
  updateOrderStatus,
  getMyResturantOrders,
};
