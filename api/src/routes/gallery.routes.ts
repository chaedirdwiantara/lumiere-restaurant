import { Router, Request, Response, NextFunction } from 'express';
import { galleryController } from '../controllers/gallery.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';
import { uploadSingle, handleUploadError } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * /api/gallery/images:
 *   get:
 *     tags:
 *       - Gallery Management
 *     summary: Get all gallery images
 *     description: Retrieve all gallery images with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of images to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of images to skip
 *     responses:
 *       200:
 *         description: Successfully retrieved gallery images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery images retrieved successfully"
 *               data:
 *                 images:
 *                   - id: "1"
 *                     title: "Elegant Dining Room"
 *                     description: "Luxurious dining experience"
 *                     imageUrl: "https://example.com/image1.jpg"
 *                     altText: "Elegant dining room interior"
 *                     isActive: true
 *                     isFeatured: true
 *                     displayOrder: 1
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *                 total: 25
 *                 limit: 20
 *                 offset: 0
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/images', galleryController.getImages.bind(galleryController));

/**
 * @swagger
 * /api/gallery/featured:
 *   get:
 *     tags:
 *       - Gallery Management
 *     summary: Get featured gallery images
 *     description: Retrieve only featured gallery images
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of featured images to return
 *     responses:
 *       200:
 *         description: Successfully retrieved featured gallery images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Featured gallery images retrieved successfully"
 *               data:
 *                 images:
 *                   - id: "1"
 *                     title: "Signature Dish"
 *                     description: "Our most popular dish"
 *                     imageUrl: "https://example.com/featured1.jpg"
 *                     altText: "Signature dish presentation"
 *                     isActive: true
 *                     isFeatured: true
 *                     displayOrder: 1
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *                 total: 5
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/featured', galleryController.getFeaturedImages.bind(galleryController));

/**
 * @swagger
 * /api/gallery/images/{id}:
 *   get:
 *     tags:
 *       - Gallery Management
 *     summary: Get single gallery image by ID
 *     description: Retrieve a specific gallery image by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gallery image ID
 *     responses:
 *       200:
 *         description: Successfully retrieved gallery image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery image retrieved successfully"
 *               data:
 *                 image:
 *                   id: "1"
 *                   title: "Elegant Dining Room"
 *                   description: "Luxurious dining experience"
 *                   imageUrl: "https://example.com/image1.jpg"
 *                   altText: "Elegant dining room interior"
 *                   isActive: true
 *                   isFeatured: true
 *                   displayOrder: 1
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Gallery image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Gallery image not found"
 *               error: "GALLERY_IMAGE_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/images/:id', galleryController.getImageById.bind(galleryController));

/**
 * @swagger
 * /api/gallery/images:
 *   post:
 *     tags:
 *       - Gallery Management
 *     summary: Upload new gallery image
 *     description: Upload a new image to the gallery (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               title:
 *                 type: string
 *                 description: Image title
 *                 example: "Elegant Dining Room"
 *               description:
 *                 type: string
 *                 description: Image description
 *                 example: "Luxurious dining experience"
 *               altText:
 *                 type: string
 *                 description: Alternative text for accessibility
 *                 example: "Elegant dining room interior"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the image is active
 *                 default: true
 *               isFeatured:
 *                 type: boolean
 *                 description: Whether the image is featured
 *                 default: false
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for the image
 *                 minimum: 0
 *             required:
 *               - image
 *               - title
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery image uploaded successfully"
 *               data:
 *                 image:
 *                   id: "new-id-123"
 *                   title: "Elegant Dining Room"
 *                   description: "Luxurious dining experience"
 *                   imageUrl: "https://example.com/uploads/new-image.jpg"
 *                   altText: "Elegant dining room interior"
 *                   isActive: true
 *                   isFeatured: false
 *                   displayOrder: 10
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid file or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid file format. Only JPEG, PNG, and WebP are allowed"
 *               error: "INVALID_FILE_FORMAT"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "File size exceeds maximum limit of 5MB"
 *               error: "FILE_TOO_LARGE"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/images', 
  authenticateToken,
  uploadSingle,
  handleUploadError,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await galleryController.uploadImage(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/gallery/images/{id}:
 *   put:
 *     tags:
 *       - Gallery Management
 *     summary: Update gallery image
 *     description: Update an existing gallery image (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gallery image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Image title
 *                 example: "Updated Dining Room"
 *               description:
 *                 type: string
 *                 description: Image description
 *                 example: "Updated luxurious dining experience"
 *               altText:
 *                 type: string
 *                 description: Alternative text for accessibility
 *                 example: "Updated dining room interior"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the image is active
 *               isFeatured:
 *                 type: boolean
 *                 description: Whether the image is featured
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for the image
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery image updated successfully"
 *               data:
 *                 image:
 *                   id: "1"
 *                   title: "Updated Dining Room"
 *                   description: "Updated luxurious dining experience"
 *                   imageUrl: "https://example.com/image1.jpg"
 *                   altText: "Updated dining room interior"
 *                   isActive: true
 *                   isFeatured: true
 *                   displayOrder: 1
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-02T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Gallery image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Gallery image not found"
 *               error: "GALLERY_IMAGE_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/images/:id', 
  authenticateToken,
  galleryController.updateImage.bind(galleryController)
);

/**
 * @swagger
 * /api/gallery/images/{id}:
 *   delete:
 *     tags:
 *       - Gallery Management
 *     summary: Delete gallery image
 *     description: Delete a gallery image by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gallery image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery image deleted successfully"
 *               data:
 *                 deletedId: "1"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Gallery image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Gallery image not found"
 *               error: "GALLERY_IMAGE_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/images/:id', 
  authenticateToken,
  galleryController.deleteImage.bind(galleryController)
);

/**
 * @swagger
 * /api/gallery/reorder:
 *   put:
 *     tags:
 *       - Gallery Management
 *     summary: Reorder gallery images
 *     description: Update the display order of multiple gallery images (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageOrders:
 *                 type: array
 *                 description: Array of image IDs with their new display orders
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Image ID
 *                     displayOrder:
 *                       type: integer
 *                       description: New display order
 *                       minimum: 0
 *                   required:
 *                     - id
 *                     - displayOrder
 *                 example:
 *                   - id: "1"
 *                     displayOrder: 3
 *                   - id: "2"
 *                     displayOrder: 1
 *                   - id: "3"
 *                     displayOrder: 2
 *             required:
 *               - imageOrders
 *     responses:
 *       200:
 *         description: Images reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Gallery images reordered successfully"
 *               data:
 *                 updatedCount: 3
 *                 images:
 *                   - id: "2"
 *                     displayOrder: 1
 *                   - id: "3"
 *                     displayOrder: 2
 *                   - id: "1"
 *                     displayOrder: 3
 *       400:
 *         description: Bad request - Invalid data or duplicate display orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid image orders provided"
 *               error: "INVALID_IMAGE_ORDERS"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/reorder', 
  authenticateToken,
  galleryController.reorderImages.bind(galleryController)
);

export default router;