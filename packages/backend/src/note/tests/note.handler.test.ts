import { describe, test, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { db } from "../../db/db";
import { getNotesHandler, insertNotesHandler } from "../note.handler";
import type { Request, Response, NextFunction } from "express";

// Integration tests: check note handlers + schema validation + actual database connection
// Requires running docker container with postgres database
describe("note.handler integration tests", () => {
    beforeAll(async () => {
        // Create the database schema in case not created yet, before running tests
        try {
            // Create elders table
            await db.query(`
                CREATE TABLE IF NOT EXISTS elders (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    date_of_birth DATE,
                    gender VARCHAR(10),
                    phone VARCHAR(20),
                    street_address TEXT,
                    unit_number VARCHAR(50),
                    postal_code VARCHAR(10),
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create notes table
            await db.query(`
                CREATE TABLE IF NOT EXISTS notes (
                    id SERIAL PRIMARY KEY,
                    header VARCHAR(255) NOT NULL,
                    content TEXT,
                    caregiver_id VARCHAR(255) NOT NULL,
                    assigned_elder_id INTEGER REFERENCES elders(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create caregiver_elder relationship table
            await db.query(`
                CREATE TABLE IF NOT EXISTS caregiver_elder (
                    caregiver_id VARCHAR(255),
                    elder_id INTEGER REFERENCES elders(id),
                    PRIMARY KEY (caregiver_id, elder_id)
                );
            `);

            console.log("Database tables created successfully");
        } catch (error) {
            console.error("Failed to create database tables:", error);
            throw error;
        }
    });

    beforeEach(async () => {
        // Reset the database before each test
        await db.query("BEGIN");
    });
    afterEach(async () => {
        // Rollback the database changes after each test
        await db.query("ROLLBACK");
    });

    test("check database connection, ensures tables exist", async () => {
        try {
            // Check if tables exist
            const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
            console.log("Database connected with tables:", tables);
        } catch (error) {
            console.error("Database error:", error);
        }
    });

    test("successfully insert a note and get notes using handler functions", async () => {
        // Create test elder for note assignment
        const elderInsertResult = await db.query(
            `INSERT INTO elders (
            name, date_of_birth, gender, phone
            )  
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
            [
                "Test Elder",
                new Date("1933-01-01"),
                "male",
                "82345678"
            ]
        );
        const elderId = elderInsertResult[0].id;

        // Link caregiver to elder
        await db.query(
            "INSERT INTO caregiver_elder (caregiver_id, elder_id) VALUES ($1, $2)",
            ["cgtest_123_xyz", elderId]
        );

        // Make mock request and response objects
        const mockReq: Partial<Request> = {
            body: {
                header: "Test note header",
                content: "Test note content",
                assigned_elder_id: elderId
            }
        };

        const mockRes: Partial<Response> & { locals: { user: { userId: string } } } = {
            locals: { user: { userId: "cgtest_123_xyz" } },
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const mockNext: NextFunction = vi.fn();
        await insertNotesHandler(
            mockReq as Request,
            mockRes as Response,
            mockNext
        );

        // Check if the note was inserted successfully
        expect(mockRes.status).toHaveBeenCalledWith(201);

        // Test getter method, getNotesHandler
        await getNotesHandler(
            mockReq as Request,
            mockRes as Response,
            mockNext
        );
        expect(mockRes.json).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                header: "Test note header",
                content: "Test note content",
                assigned_elder_id: elderId
            })
        ]));
    });

});