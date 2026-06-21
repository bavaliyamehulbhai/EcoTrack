const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/users', (req, res) => res.status(200).json([]));

describe('GET /api/users', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
  });
});
