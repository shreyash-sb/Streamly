import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../src/utils/token.js';

test('JWT access token generation and verification', () => {
    const payload = { id: 'user123', username: 'alice', name: 'Alice' };
    const token = generateAccessToken(payload);
    assert.ok(typeof token === 'string');

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.id, 'user123');
    assert.equal(decoded.username, 'alice');
    assert.equal(decoded.name, 'Alice');
});

test('JWT refresh token generation and verification', () => {
    const payload = { id: 'user123' };
    const token = generateRefreshToken(payload);
    assert.ok(typeof token === 'string');

    const decoded = verifyRefreshToken(token);
    assert.equal(decoded.id, 'user123');
});

test('verifyAccessToken returns null on invalid token', () => {
    const decoded = verifyAccessToken('invalid.token.string');
    assert.equal(decoded, null);
});

