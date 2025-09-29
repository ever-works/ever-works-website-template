import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getClientProfileById,
  updateClientProfile,
  deleteClientProfile
} from "@/lib/db/queries";

/**
 * @swagger
 * /api/admin/clients/{clientId}:
 *   get:
 *     tags: ["Admin - Clients"]
 *     summary: "Get client profile by ID"
 *     description: "Retrieves a specific client profile by ID. Requires admin privileges."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "clientId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Unique client identifier"
 *         example: "client_123abc"
 *     responses:
 *       200:
 *         description: "Client profile retrieved successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/ClientProfile"
 *               required: ["success", "data"]
 *       401:
 *         description: "Unauthorized - Admin access required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: "Client not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch client"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    const client = await getClientProfileById(clientId);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: client
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/clients/{clientId}:
 *   put:
 *     tags: ["Admin - Clients"]
 *     summary: "Update client profile"
 *     description: "Updates a specific client profile by ID. Supports partial updates. Requires admin privileges."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "clientId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Unique client identifier"
 *         example: "client_123abc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 description: "Display name for the client"
 *                 example: "John Doe Updated"
 *               username:
 *                 type: string
 *                 description: "Unique username"
 *                 example: "johndoe_updated"
 *               bio:
 *                 type: string
 *                 description: "Client biography"
 *                 example: "Senior Developer at Tech Corp"
 *               jobTitle:
 *                 type: string
 *                 description: "Job title"
 *                 example: "Lead Developer"
 *               company:
 *                 type: string
 *                 description: "Company name"
 *                 example: "Tech Corp Inc"
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive", "suspended", "trial"]
 *                 description: "Client account status"
 *                 example: "active"
 *               plan:
 *                 type: string
 *                 enum: ["free", "standard", "premium"]
 *                 description: "Subscription plan"
 *                 example: "premium"
 *               accountType:
 *                 type: string
 *                 enum: ["individual", "business", "enterprise"]
 *                 description: "Account type"
 *                 example: "business"
 *     responses:
 *       200:
 *         description: "Client updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/ClientProfile"
 *                 message:
 *                   type: string
 *                   example: "Client updated successfully"
 *               required: ["success", "data", "message"]
 *       401:
 *         description: "Unauthorized - Admin access required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: "Client not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update client"
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    const data = await request.json();

    const client = await updateClientProfile(clientId, data);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: client
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/clients/{clientId}:
 *   delete:
 *     tags: ["Admin - Clients"]
 *     summary: "Delete client profile"
 *     description: "Permanently deletes a client profile by ID. This action cannot be undone. Requires admin privileges."
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - name: "clientId"
 *         in: "path"
 *         required: true
 *         schema:
 *           type: string
 *         description: "Unique client identifier"
 *         example: "client_123abc"
 *     responses:
 *       200:
 *         description: "Client deleted successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Client deleted successfully"
 *               required: ["success", "message"]
 *       401:
 *         description: "Unauthorized - Admin access required"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: "Client not found"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Client not found"
 *       500:
 *         description: "Internal server error"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete client"
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    const success = await deleteClientProfile(clientId);

    if (!success) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 