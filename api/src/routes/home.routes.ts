import { Router } from 'express';
import { homeController } from '../controllers/home.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/home/content:
 *   get:
 *     tags:
 *       - Home Content Management
 *     summary: Get all home content sections
 *     description: Retrieve all home content sections with their data
 *     responses:
 *       200:
 *         description: Successfully retrieved home content sections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content retrieved successfully"
 *               data:
 *                 content:
 *                   - id: "1"
 *                     sectionKey: "hero"
 *                     title: "Welcome to Lumière Restaurant"
 *                     subtitle: "Fine Dining Experience"
 *                     content: "Experience culinary excellence in an elegant atmosphere"
 *                     imageUrl: "https://example.com/hero-image.jpg"
 *                     isActive: true
 *                     displayOrder: 1
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *                   - id: "2"
 *                     sectionKey: "about"
 *                     title: "About Us"
 *                     subtitle: "Our Story"
 *                     content: "Established in 1985, we bring you the finest cuisine"
 *                     imageUrl: "https://example.com/about-image.jpg"
 *                     isActive: true
 *                     displayOrder: 2
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/content', homeController.getAllContent.bind(homeController));

/**
 * @swagger
 * /api/home/content/{section}:
 *   get:
 *     tags:
 *       - Home Content Management
 *     summary: Get home content by section key
 *     description: Retrieve a specific home content section by its key
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *         description: Section key (e.g., hero, about, services)
 *         example: "hero"
 *     responses:
 *       200:
 *         description: Successfully retrieved home content section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content section retrieved successfully"
 *               data:
 *                 content:
 *                   id: "1"
 *                   sectionKey: "hero"
 *                   title: "Welcome to Lumière Restaurant"
 *                   subtitle: "Fine Dining Experience"
 *                   content: "Experience culinary excellence in an elegant atmosphere"
 *                   imageUrl: "https://example.com/hero-image.jpg"
 *                   isActive: true
 *                   displayOrder: 1
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Home content section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Home content section not found"
 *               error: "HOME_CONTENT_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/content/:section', homeController.getContentBySection.bind(homeController));

/**
 * @swagger
 * /api/home/content:
 *   post:
 *     tags:
 *       - Home Content Management
 *     summary: Create new home content section
 *     description: Create a new home content section (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectionKey:
 *                 type: string
 *                 description: Unique section key
 *                 example: "services"
 *               title:
 *                 type: string
 *                 description: Section title
 *                 example: "Our Services"
 *               subtitle:
 *                 type: string
 *                 description: Section subtitle
 *                 example: "What We Offer"
 *               content:
 *                 type: string
 *                 description: Section content/description
 *                 example: "We provide exceptional dining services"
 *               imageUrl:
 *                 type: string
 *                 description: Section image URL
 *                 example: "https://example.com/services-image.jpg"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the section is active
 *                 default: true
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for the section
 *                 minimum: 0
 *                 example: 3
 *             required:
 *               - sectionKey
 *               - title
 *     responses:
 *       201:
 *         description: Home content section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content section created successfully"
 *               data:
 *                 content:
 *                   id: "new-id-123"
 *                   sectionKey: "services"
 *                   title: "Our Services"
 *                   subtitle: "What We Offer"
 *                   content: "We provide exceptional dining services"
 *                   imageUrl: "https://example.com/services-image.jpg"
 *                   isActive: true
 *                   displayOrder: 3
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid data or section key already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Section key already exists"
 *               error: "SECTION_KEY_EXISTS"
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
router.post('/content', 
  authenticateToken,
  homeController.createContent.bind(homeController)
);

/**
 * @swagger
 * /api/home/content/{section}:
 *   put:
 *     tags:
 *       - Home Content Management
 *     summary: Update home content section
 *     description: Update an existing home content section (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *         description: Section key to update
 *         example: "hero"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Section title
 *                 example: "Updated Welcome Message"
 *               subtitle:
 *                 type: string
 *                 description: Section subtitle
 *                 example: "Updated Fine Dining Experience"
 *               content:
 *                 type: string
 *                 description: Section content/description
 *                 example: "Updated culinary excellence description"
 *               imageUrl:
 *                 type: string
 *                 description: Section image URL
 *                 example: "https://example.com/updated-hero-image.jpg"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the section is active
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for the section
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Home content section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content section updated successfully"
 *               data:
 *                 content:
 *                   id: "1"
 *                   sectionKey: "hero"
 *                   title: "Updated Welcome Message"
 *                   subtitle: "Updated Fine Dining Experience"
 *                   content: "Updated culinary excellence description"
 *                   imageUrl: "https://example.com/updated-hero-image.jpg"
 *                   isActive: true
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
 *         description: Home content section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Home content section not found"
 *               error: "HOME_CONTENT_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/content/:section', 
  authenticateToken,
  homeController.updateContent.bind(homeController)
);

/**
 * @swagger
 * /api/home/content/{section}:
 *   delete:
 *     tags:
 *       - Home Content Management
 *     summary: Delete home content section
 *     description: Delete a home content section by section key (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *         description: Section key to delete
 *         example: "services"
 *     responses:
 *       200:
 *         description: Home content section deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content section deleted successfully"
 *               data:
 *                 deletedSection: "services"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Home content section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Home content section not found"
 *               error: "HOME_CONTENT_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/content/:section', 
  authenticateToken,
  homeController.deleteContent.bind(homeController)
);

/**
 * @swagger
 * /api/home/content/{section}/toggle:
 *   patch:
 *     tags:
 *       - Home Content Management
 *     summary: Toggle home content section active status
 *     description: Toggle the active status of a home content section (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: section
 *         required: true
 *         schema:
 *           type: string
 *         description: Section key to toggle
 *         example: "hero"
 *     responses:
 *       200:
 *         description: Home content section status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Home content section status toggled successfully"
 *               data:
 *                 content:
 *                   id: "1"
 *                   sectionKey: "hero"
 *                   title: "Welcome to Lumière Restaurant"
 *                   subtitle: "Fine Dining Experience"
 *                   content: "Experience culinary excellence in an elegant atmosphere"
 *                   imageUrl: "https://example.com/hero-image.jpg"
 *                   isActive: false
 *                   displayOrder: 1
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-02T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Home content section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Home content section not found"
 *               error: "HOME_CONTENT_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/content/:section/toggle', 
  authenticateToken,
  homeController.toggleActiveStatus.bind(homeController)
);

/**
 * @swagger
 * /api/home/hero:
 *   get:
 *     tags:
 *       - Home Content Management
 *     summary: Get hero section content
 *     description: Retrieve the hero section content specifically
 *     responses:
 *       200:
 *         description: Successfully retrieved hero section content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Hero content retrieved successfully"
 *               data:
 *                 hero:
 *                   id: "1"
 *                   sectionKey: "hero"
 *                   title: "Welcome to Lumière Restaurant"
 *                   subtitle: "Fine Dining Experience"
 *                   content: "Experience culinary excellence in an elegant atmosphere"
 *                   imageUrl: "https://example.com/hero-image.jpg"
 *                   isActive: true
 *                   displayOrder: 1
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Hero section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Hero section not found"
 *               error: "HERO_SECTION_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/hero', homeController.getHeroContent.bind(homeController));

/**
 * @swagger
 * /api/home/hero:
 *   put:
 *     tags:
 *       - Home Content Management
 *     summary: Update hero section content
 *     description: Update the hero section content specifically (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Hero section title
 *                 example: "Welcome to Our Restaurant"
 *               subtitle:
 *                 type: string
 *                 description: Hero section subtitle
 *                 example: "Exceptional Culinary Experience"
 *               content:
 *                 type: string
 *                 description: Hero section content/description
 *                 example: "Discover the finest cuisine in an elegant atmosphere"
 *               imageUrl:
 *                 type: string
 *                 description: Hero section background image URL
 *                 example: "https://example.com/new-hero-image.jpg"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the hero section is active
 *     responses:
 *       200:
 *         description: Hero section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Hero section updated successfully"
 *               data:
 *                 hero:
 *                   id: "1"
 *                   sectionKey: "hero"
 *                   title: "Welcome to Our Restaurant"
 *                   subtitle: "Exceptional Culinary Experience"
 *                   content: "Discover the finest cuisine in an elegant atmosphere"
 *                   imageUrl: "https://example.com/new-hero-image.jpg"
 *                   isActive: true
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
 *         description: Hero section not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Hero section not found"
 *               error: "HERO_SECTION_NOT_FOUND"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/hero', 
  authenticateToken,
  homeController.updateHeroContent.bind(homeController)
);

export default router;