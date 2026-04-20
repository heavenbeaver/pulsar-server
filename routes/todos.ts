import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

interface TodoPayload {
    title: string;
    desc: string;
    expireDate?: string;
    createDate: string;
    updateDate: string;
    priority: string;
    status: string;
    creator: string;
    responsible?: string;
}

router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
    const { userId } = req.query;

    let query = supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

    if (userId) {
        query = query.or(`creator.eq.${userId},responsible.eq.${userId}`).in('status', ['К выполнению','Выполняется']).order('updateDate', { ascending: false });
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

router.get("/archived", async (req: Request, res: Response) => {
    const { userId, page = 1, limit = 15 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
        .from('todos')
        .select('*', {count: 'exact'}) // получаем общее количество
        .in('status', ['Выполнена', 'Отменена'])
        .range(offset, offset + limitNum - 1) // пагинация
        .order('id', { ascending: true });

    if (userId) {
        query = query.or(`creator.eq.${userId},responsible.eq.${userId}`)
    }

    const { data, error, count } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json({
        data,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil((count || 0) / limitNum),
            totalItems: count,
            limit: limitNum
        }
    });
})

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Todo not found" });
    res.json(data);
});

router.post("/", async (req: Request<{}, {}, TodoPayload>, res: Response) => {
    const { title, desc, expireDate, priority, status, creator, responsible } = req.body;
    const { data, error } = await supabase
        .from("todos")
        .insert([{ title, desc, expireDate, priority, status, creator, responsible }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

router.put("/:id", async (req: Request<{ id: string }, {}, Partial<TodoPayload>>, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0] || null);
});

router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).end();
});

export default router;