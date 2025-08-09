import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import { db } from ".././db/db";
import {
  getAppointmentsHandler,
  createAppointmentHandler,
} from "./appointment.handler";
import type { Request, Response, NextFunction } from "express";

// Integration tests (bottom-up): using sql queries on actual db + schema validation + handler functions
// Requires running docker container with postgres database
describe("appointment.handler integration tests", () => {
  beforeAll(async () => {
    // Clean the database before running tests
    try {
      await db.query("DROP TABLE IF EXISTS appointments CASCADE");
      await db.query("DROP TABLE IF EXISTS elders CASCADE");
      await db.query("DROP TABLE IF EXISTS caregiver_elder CASCADE");
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error cleaning database:", error);
      throw error;
    }
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
                CREATE TABLE IF NOT EXISTS appointments (
                    appt_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    elder_id INT NOT NULL,
                    startDateTime TIMESTAMP,
                    endDateTime TIMESTAMP,
                    details TEXT,
                    name TEXT,
                    loc TEXT,
                    accepted TEXT,
                    created_by TEXT,
                    declined TEXT[] DEFAULT '{}',
                    FOREIGN KEY (elder_id) REFERENCES elders(id)
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

  test("successfully insert a appointment and get appointments using handler functions", async () => {
    // Create test elder for note assignment
    const elderInsertResult = await db.query(
      `INSERT INTO elders (
            name, date_of_birth, gender, phone
            )  
            VALUES ($1, $2, $3, $4)
            RETURNING *;`,
      ["Test Elder", new Date("1933-01-01"), "male", "82345678"]
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
        elder_id: elderId,
        startDateTime: new Date("2025-07-23T10:00:00.000Z"),
        endDateTime: new Date("2025-07-23T11:00:00.000Z"),
        name: "Test",
      },
    };

    const mockCreateRes: Partial<Response> & {
      locals: { user: { userId: string } };
    } = {
      locals: { user: { userId: "cgtest_123_xyz" } },
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const mockNext: NextFunction = vi.fn();
    await createAppointmentHandler(
      mockReq as Request,
      mockCreateRes as Response,
      mockNext
    );

    // Check if the appointment was inserted successfully
    expect(mockCreateRes.status).toHaveBeenCalledWith(201);

    const mockGetReq: Partial<Request> = {
      params: { elder_id: `${elderId}` },
    };

    const mockGetRes: Partial<Response> & {
      locals: { user: { userId: string } };
    } = {
      locals: { user: { userId: "cgtest_123_xyz" } },
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Test getter method, getAppointmentsHandler
    await getAppointmentsHandler(
      mockGetReq as Request,
      mockGetRes as Response,
      mockNext
    );
    expect(mockGetRes.json).toHaveBeenCalledWith([
      {
        appt_id: 1,
        elder_id: elderId,
        name: "Test",
        details: null,
        loc: null,
        created_by: "cgtest_123_xyz",
        startDateTime: new Date("2025-07-23T10:00:00.000Z"),
        endDateTime: new Date("2025-07-23T11:00:00.000Z"),
      },
    ]);
  });
});
