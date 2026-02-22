import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

const VERIFY_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN;

// 健康检查
app.get("/", (req, res) => res.status(200).send("ok"));

app.get("/webhook/feishu", (req, res) => {
  res.status(200).json({ ok: true, msg: "webhook endpoint reachable" });
});

// 飞书事件回调入口
app.post("/webhook/feishu", (req, res) => {
  const body = req.body || {};

  console.log("Incoming headers:", JSON.stringify(req.headers));
  console.log("Incoming body:", JSON.stringify(body));

  // 只要带 challenge（URL 验证），直接返回
  if (body.challenge) {
    return res.json({ challenge: body.challenge });
  }

  // 普通事件先直接 ack
  return res.status(200).json({ ok: true });
});

  // 2) 普通事件：校验 token（飞书事件 body.header.token）
  if (VERIFY_TOKEN && body?.header?.token && body.header.token !== VERIFY_TOKEN) {
    return res.status(401).json({ msg: "invalid verification token" });
  }

  // 先打印看看事件结构（Render 日志里能看到）
  console.log("Feishu event received:", JSON.stringify(body));

  // 先直接 200，表示收到了
  return res.status(200).json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));