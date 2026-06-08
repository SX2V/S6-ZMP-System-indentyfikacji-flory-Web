import { describe, it, expect } from 'vitest';
import { createRegisterSchema } from '../schemats/registerSchema';

const schema = createRegisterSchema('pl');

describe('registerSchema - walidacja', () => {
    const valid = {
        username: 'janek',
        email: 'jan@example.com',
        password: 'Haslo123!',
        confirmPassword: 'Haslo123!',
    };

    it('przepuszcza poprawne dane', async () => {
        const result = await schema.safeParseAsync(valid);
        expect(result.success).toBe(true);
    });

    it('odrzuca za krótką nazwę użytkownika', async () => {
        const result = await schema.safeParseAsync({ ...valid, username: 'ab' });
        expect(result.success).toBe(false);
    });

    it('odrzuca niepoprawny email', async () => {
        const result = await schema.safeParseAsync({ ...valid, email: 'to-nie-email' });
        expect(result.success).toBe(false);
    });

    it('odrzuca hasło bez wielkiej litery', async () => {
        const result = await schema.safeParseAsync({
            ...valid,
            password: 'haslo123!',
            confirmPassword: 'haslo123!',
        });
        expect(result.success).toBe(false);
    });

    it('odrzuca hasło bez cyfry', async () => {
        const result = await schema.safeParseAsync({
            ...valid,
            password: 'Hasloooo!',
            confirmPassword: 'Hasloooo!',
        });
        expect(result.success).toBe(false);
    });

    it('odrzuca hasło bez znaku specjalnego', async () => {
        const result = await schema.safeParseAsync({
            ...valid,
            password: 'Haslo1234',
            confirmPassword: 'Haslo1234',
        });
        expect(result.success).toBe(false);
    });

    it('odrzuca hasło krótsze niż 8 znaków', async () => {
        const result = await schema.safeParseAsync({
            ...valid,
            password: 'Ha1!',
            confirmPassword: 'Ha1!',
        });
        expect(result.success).toBe(false);
    });

    it('odrzuca gdy hasła się nie zgadzają', async () => {
        const result = await schema.safeParseAsync({ ...valid, confirmPassword: 'InneHaslo123!' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path[0]);
            expect(paths).toContain('confirmPassword');
        }
    });

    it('działa też dla języka angielskiego', async () => {
        const enSchema = createRegisterSchema('en');
        const result = await enSchema.safeParseAsync(valid);
        expect(result.success).toBe(true);
    });
});
