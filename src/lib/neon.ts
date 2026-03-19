import { neon } from "@neondatabase/serverless";

const databaseUrl = import.meta.env.VITE_DATABASE_URL || "";

export const sql = databaseUrl ? neon(databaseUrl) : null;

// Check if Neon is configured
export const isNeonConfigured = () => {
  return databaseUrl !== "" && sql !== null;
};

// Database types matching the schema
export interface DbListing {
  id: string;
  title: string;
  type: "出售" | "收購";
  location: string;
  price: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  owner_name: string;
  sold: boolean;
}

// Query helpers
export const listingsQuery = {
  async getAll(): Promise<DbListing[]> {
    if (!sql) return [];
    try {
      const result = await sql`
        SELECT * FROM listings
        ORDER BY created_at DESC
      `;
      return result as DbListing[];
    } catch (error) {
      console.error("Error fetching listings:", error);
      return [];
    }
  },

  async create(listing: Omit<DbListing, "created_at">): Promise<DbListing | null> {
    if (!sql) return null;
    try {
      const result = await sql`
        INSERT INTO listings (id, title, type, location, price, description, image_url, owner_name, sold)
        VALUES (${listing.id}, ${listing.title}, ${listing.type}, ${listing.location}, ${listing.price},
                ${listing.description}, ${listing.image_url}, ${listing.owner_name}, ${listing.sold})
        RETURNING *
      `;
      return result[0] as DbListing;
    } catch (error) {
      console.error("Error creating listing:", error);
      return null;
    }
  },

  async update(id: string, updates: Partial<Omit<DbListing, "id" | "created_at">>): Promise<DbListing | null> {
    if (!sql) return null;
    try {
      // Build the update query dynamically based on provided fields
      const fields = [];
      const values = [];

      if (updates.title !== undefined) {
        fields.push('title');
        values.push(updates.title);
      }
      if (updates.type !== undefined) {
        fields.push('type');
        values.push(updates.type);
      }
      if (updates.location !== undefined) {
        fields.push('location');
        values.push(updates.location);
      }
      if (updates.price !== undefined) {
        fields.push('price');
        values.push(updates.price);
      }
      if (updates.description !== undefined) {
        fields.push('description');
        values.push(updates.description);
      }
      if (updates.image_url !== undefined) {
        fields.push('image_url');
        values.push(updates.image_url);
      }
      if (updates.owner_name !== undefined) {
        fields.push('owner_name');
        values.push(updates.owner_name);
      }
      if (updates.sold !== undefined) {
        fields.push('sold');
        values.push(updates.sold);
      }

      if (fields.length === 0) return null;

      // Build SET clause
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const query = `UPDATE listings SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

      const result = await sql(query, [...values, id]);
      return result[0] as DbListing;
    } catch (error) {
      console.error("Error updating listing:", error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    if (!sql) return false;
    try {
      await sql`DELETE FROM listings WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error("Error deleting listing:", error);
      return false;
    }
  },

  async deleteAll(): Promise<boolean> {
    if (!sql) return false;
    try {
      await sql`DELETE FROM listings`;
      return true;
    } catch (error) {
      console.error("Error deleting all listings:", error);
      return false;
    }
  },
};
