const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");
const { UserModel } = require("../model/UserModel");
const { BookModel } = require("../model/BookModel");
const { BorrowModel } = require("../model/BorrowModel");
const { ContactModel } = require("../model/ContactModel");
const { OtpModel } = require("../model/OtpModel");

let mongoServer;

const SEED_PASSWORD = "Passw0rd!";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Promise.all([
    UserModel.deleteMany({}),
    BookModel.deleteMany({}),
    BorrowModel.deleteMany({}),
    ContactModel.deleteMany({}),
    OtpModel.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

const registerUserViaApi = async (overrides = {}) => {
  const uniqueSuffix = Date.now() + Math.random().toString(16).slice(2);
  const email = overrides.email || `user-${uniqueSuffix}@test.com`;
  const password = overrides.password || SEED_PASSWORD;
  const payload = {
    name: overrides.name || "Test User",
    email,
    password,
    stream: overrides.stream || "CSE",
    year: overrides.year || 2,
    role: overrides.role || "user",
  };

  await request(app).post("/users/register").send(payload).expect(201);
  return { email, password };
};

const createBook = async ({ addedBy }) => {
  return BookModel.create({
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programming",
    isbn: `97801323${Date.now()}`,
    description: "A handbook of agile software craftsmanship.",
    availableCopies: 5,
    totalCopies: 5,
    addedBy,
    coverImage: "https://example.com/cover.jpg",
    cloudinaryId: "test-cloudinary-id",
    price: 49,
  });
};

const createAdminUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, salt);
  const uniqueSuffix = Date.now() + Math.random().toString(16).slice(2);
  return UserModel.create({
    name: "Admin Tester",
    email: `admin-${uniqueSuffix}@test.com`,
    password: passwordHash,
    role: "admin",
  });
};

describe("Library backend API", () => {
  it("responds to health check", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("API is running...");
  });

  it("registers, logs in, and fetches user profile", async () => {
    const credentials = await registerUserViaApi();

    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    expect(loginRes.body).toHaveProperty("token");
    expect(loginRes.body.user).toMatchObject({
      email: credentials.email,
      role: "user",
    });

    const profileRes = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(profileRes.body).toMatchObject({
      error: false,
      user: expect.objectContaining({ email: credentials.email }),
    });
  });

  it("stores contact messages", async () => {
    const res = await request(app)
      .post("/users/contact")
      .send({
        name: "Jane",
        email: "jane@example.com",
        subject: "Library hours",
        message: "Please extend the timings.",
      })
      .expect(200);

    expect(res.body).toMatchObject({
      success: true,
    });

    const storedContacts = await ContactModel.countDocuments();
    expect(storedContacts).toBe(1);
  });

  it("returns home dashboard data even without seed data", async () => {
    const res = await request(app).get("/home").expect(200);
    expect(res.body).toMatchObject({
      error: false,
      stats: expect.objectContaining({
        totalBooks: expect.any(Number),
        totalCategories: expect.any(Number),
        totalActiveStudents: expect.any(Number),
      }),
      categories: expect.any(Array),
      newArrivals: expect.any(Array),
    });
  });

  it("lists books when inventory exists", async () => {
    const admin = await createAdminUser();
    await createBook({ addedBy: admin._id });

    const res = await request(app).get("/books").expect(200);
    expect(res.body).toMatchObject({
      error: false,
      totalBooks: 1,
    });
    expect(res.body.books[0]).toMatchObject({
      title: "Clean Code",
      author: "Robert C. Martin",
    });
  });

  it("allows a user to request issuing a book", async () => {
    const admin = await createAdminUser();
    const book = await createBook({ addedBy: admin._id });
    const credentials = await registerUserViaApi();

    const loginRes = await request(app)
      .post("/users/login")
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);

    const res = await request(app)
      .post(`/books/borrow/request-issue/${book._id.toString()}`)
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(res.body).toMatchObject({
      error: false,
      message: expect.stringContaining("Book request submitted"),
    });

    const borrowRecords = await BorrowModel.countDocuments();
    expect(borrowRecords).toBe(1);
  });
});

