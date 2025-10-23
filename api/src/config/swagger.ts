import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Luxury Restaurant CMS API',
      version: '1.0.0',
      description: 'Backend API for managing restaurant content including gallery images and home page content',
      contact: {
        name: 'Luxury Restaurant CMS Team',
        email: 'support@luxuryrestaurant.com',
        url: 'https://luxuryrestaurant.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}${config.app.apiPrefix}`,
        description: 'Development server'
      },
      {
        url: 'https://api.luxuryrestaurant.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        }
      },
      schemas: {
        // Error Responses
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          },
          required: ['success', 'message']
        },
        
        // Success Response
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          },
          required: ['success', 'message']
        },

        // Authentication Schemas
        LoginCredentials: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@luxuryrestaurant.com',
              description: 'Admin email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'securePassword123',
              description: 'Admin password'
            }
          },
          required: ['email', 'password']
        },

        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT access token'
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT refresh token'
            },
            expiresIn: {
              type: 'number',
              example: 3600,
              description: 'Token expiration time in seconds'
            }
          },
          required: ['accessToken', 'refreshToken', 'expiresIn']
        },

        Admin: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Admin unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@luxuryrestaurant.com',
              description: 'Admin email address'
            },
            name: {
              type: 'string',
              example: 'Admin User',
              description: 'Admin full name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'super_admin'],
              example: 'admin',
              description: 'Admin role'
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Admin account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Last update timestamp'
            }
          },
          required: ['id', 'email', 'name', 'role', 'isActive']
        },

        // Gallery Schemas
        GalleryImage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Image unique identifier'
            },
            title: {
              type: 'string',
              example: 'Elegant Dining Room',
              description: 'Image title'
            },
            description: {
              type: 'string',
              example: 'Beautiful dining room with luxury ambiance',
              description: 'Image description'
            },
            altText: {
              type: 'string',
              example: 'Luxury restaurant dining room interior',
              description: 'Alternative text for accessibility'
            },
            originalUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.supabase.co/v1/object/public/gallery/original/image.jpg',
              description: 'Original image URL'
            },
            thumbnailUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.supabase.co/v1/object/public/gallery/thumbnail/image.jpg',
              description: 'Thumbnail image URL'
            },
            mediumUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.supabase.co/v1/object/public/gallery/medium/image.jpg',
              description: 'Medium size image URL'
            },
            category: {
              type: 'string',
              enum: ['interior', 'food', 'ambiance', 'exterior'],
              example: 'interior',
              description: 'Image category'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['dining', 'luxury', 'elegant'],
              description: 'Image tags'
            },
            isFeatured: {
              type: 'boolean',
              example: true,
              description: 'Whether image is featured'
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Whether image is active/visible'
            },
            sortOrder: {
              type: 'number',
              example: 1,
              description: 'Display order'
            },
            metadata: {
              type: 'object',
              properties: {
                width: {
                  type: 'number',
                  example: 1920
                },
                height: {
                  type: 'number',
                  example: 1080
                },
                fileSize: {
                  type: 'number',
                  example: 2048576
                },
                format: {
                  type: 'string',
                  example: 'jpeg'
                }
              },
              description: 'Image metadata'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Last update timestamp'
            }
          },
          required: ['id', 'title', 'originalUrl', 'category', 'isActive']
        },

        // Home Content Schemas
        HomeContent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Content unique identifier'
            },
            section: {
              type: 'string',
              enum: ['hero', 'about', 'features', 'testimonials'],
              example: 'hero',
              description: 'Content section type'
            },
            title: {
              type: 'string',
              example: 'Welcome to Luxury Restaurant',
              description: 'Section title'
            },
            subtitle: {
              type: 'string',
              example: 'Experience Fine Dining at Its Best',
              description: 'Section subtitle'
            },
            content: {
              type: 'string',
              example: 'Discover our exquisite cuisine and elegant ambiance...',
              description: 'Main content text'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.supabase.co/v1/object/public/home/hero-image.jpg',
              description: 'Section image URL'
            },
            buttonText: {
              type: 'string',
              example: 'Make Reservation',
              description: 'Call-to-action button text'
            },
            buttonUrl: {
              type: 'string',
              format: 'uri',
              example: '/reservation',
              description: 'Call-to-action button URL'
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Whether section is active/visible'
            },
            sortOrder: {
              type: 'number',
              example: 1,
              description: 'Display order'
            },
            metadata: {
              type: 'object',
              description: 'Additional section metadata'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T00:00:00.000Z',
              description: 'Last update timestamp'
            }
          },
          required: ['id', 'section', 'title', 'isActive']
        },

        // Request Schemas
        CreateGalleryImageRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Elegant Dining Room',
              description: 'Image title'
            },
            description: {
              type: 'string',
              example: 'Beautiful dining room with luxury ambiance',
              description: 'Image description'
            },
            altText: {
              type: 'string',
              example: 'Luxury restaurant dining room interior',
              description: 'Alternative text for accessibility'
            },
            category: {
              type: 'string',
              enum: ['interior', 'food', 'ambiance', 'exterior'],
              example: 'interior',
              description: 'Image category'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['dining', 'luxury', 'elegant'],
              description: 'Image tags'
            },
            isFeatured: {
              type: 'boolean',
              example: false,
              description: 'Whether image should be featured'
            }
          },
          required: ['title', 'category']
        },

        UpdateHomeContentRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Welcome to Luxury Restaurant',
              description: 'Section title'
            },
            subtitle: {
              type: 'string',
              example: 'Experience Fine Dining at Its Best',
              description: 'Section subtitle'
            },
            content: {
              type: 'string',
              example: 'Discover our exquisite cuisine and elegant ambiance...',
              description: 'Main content text'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.supabase.co/v1/object/public/home/hero-image.jpg',
              description: 'Section image URL'
            },
            buttonText: {
              type: 'string',
              example: 'Make Reservation',
              description: 'Call-to-action button text'
            },
            buttonUrl: {
              type: 'string',
              format: 'uri',
              example: '/reservation',
              description: 'Call-to-action button URL'
            }
          }
        },

        ChangePasswordRequest: {
          type: 'object',
          properties: {
            currentPassword: {
              type: 'string',
              example: 'currentPassword123',
              description: 'Current password'
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              example: 'newSecurePassword123',
              description: 'New password'
            }
          },
          required: ['currentPassword', 'newPassword']
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Admin authentication and authorization endpoints'
      },
      {
        name: 'Gallery',
        description: 'Gallery image management endpoints'
      },
      {
        name: 'Home Content',
        description: 'Home page content management endpoints'
      },
      {
        name: 'System',
        description: 'System information and health check endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);