import { Request, Response } from "express";
import { AppError, AsyncWrapper } from "../utils";
import {
  ApiErrorMessages,
  HttpStatusCode,
  ApiSuccessMessages,
} from "../constants";
import { Product } from "../models";
import slugify from "slugify";
import { cloudinary } from "../lib";

export const GetAllProducts = AsyncWrapper(
  async (req: Request, res: Response) => {
    const products = await Product.find({});

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: products,
    });
  }
);

export const GetSingleProduct = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: product,
    });
  }
);

export const GetFeaturedProducts = AsyncWrapper(
  async (req: Request, res: Response) => {
    const featuredProducts = await Product.find({ isFeatured: true })
      .lean()
      .limit(8);

    if (!featuredProducts) {
      throw new AppError(
        ApiErrorMessages.NO_FEATURED_PRODUCTS_FOUND,
        HttpStatusCode.BAD_REQUEST
      );
    }

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: featuredProducts,
    });
  }
);

export const CreateProduct = AsyncWrapper(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      price,
      image,
      category,
      brand,
      targetAudience,
      stock,
    } = req.body;

    const slug = slugify(name, {
      lower: true,
    });

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "ecommerce_products",
      });
    }

    await Product.create({
      name,
      description,
      price,
      slug,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
      brand,
      targetAudience,
      stock,
    });

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: ApiSuccessMessages.PRODUCT_CREATED_SUCCESS,
    });
  }
);

export const DeleteProduct = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      throw new AppError(
        ApiErrorMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST
      );
    }
    if (existingProduct.image) {
      const publicId = existingProduct.image.split("/").pop()?.split(".")[0];
      await cloudinary.uploader.destroy(`ecommerce_products/${publicId}`);
    }

    await Product.findByIdAndDelete(id);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: ApiSuccessMessages.PRODUCT_DELETED_SUCCESS,
    });
  }
);

export const GetProductsByCategory = AsyncWrapper(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const cat = req.query.cat;
    const skip = (page - 1) * limit;

    const products = await Product.find({ category: cat })
      .skip(skip)
      .limit(limit);
    const count = await Product.countDocuments({ category: cat });
    const totalPages = Math.ceil(count / limit);
    const lastPage = page === totalPages;
    const firstPage = page === 1;

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: products,
      pagination: {
        totalPages,
        last: lastPage,
        first: firstPage,
      },
    });
  }
);

export const ToggleFeaturedProduct = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (existingProduct) {
      existingProduct.isFeatured = !existingProduct.isFeatured;
      await existingProduct.save();
      res.status(HttpStatusCode.OK).json({
        success: true,
        data: existingProduct,
      });
    }
  }
);

export const GetRecommendedProducts = AsyncWrapper(
  async (req: Request, res: Response) => {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      { $project: { _id: 1, name: 1, image: 1, description: 1, price: 1 } },
    ]);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: products,
    });
  }
);

export const GetCategoriesAndProductCount = AsyncWrapper(
  async (req: Request, res: Response) => {
    const products = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          productCount: 1,
          _id: 0,
        },
      },
      {
        $limit: 8,
      },
    ]);

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: products,
    });
  }
);

export const GetProductsByTarget = AsyncWrapper(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    let products;
    if (type === "all") {
      products = await Product.find({}).skip(skip).limit(limit);
    } else {
      products = await Product.find({ targetAudience: type })
        .skip(skip)
        .limit(limit);
    }

    const count = await Product.countDocuments({ targetAudience: type });
    const totalPages = Math.ceil(count / limit);
    const lastPage = page === totalPages;
    const firstPage = page === 1;

    res.status(HttpStatusCode.OK).json({
      success: true,
      data: products,
      pagination: {
        totalPages,
        first: firstPage,
        last: lastPage,
      },
    });
  }
);

export const DisableProduct = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (existingProduct) {
      existingProduct.isActive = !existingProduct.isActive;
      await existingProduct.save();
      res.status(HttpStatusCode.OK).json({
        success: true,
        message: existingProduct.isActive
          ? ApiSuccessMessages.PRODUCT_ENABLED
          : ApiSuccessMessages.PRODUCT_DISABLED,
      });
    } else {
      throw new AppError(
        ApiErrorMessages.PRODUCT_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST
      );
    }
  }
);
