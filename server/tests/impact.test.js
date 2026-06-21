const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/impact', (req, res) => res.status(200).json([]));

describe('GET /api/impact', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/impact');
    expect(res.statusCode).toBe(200);
  });
});
