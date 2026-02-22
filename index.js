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

  // 1) URL 验证（飞书第一次配置 Request URL 会发 challenge）
  // 你需要原样返回 { "challenge": "..." }
  if (body.type === "url_verification" && body.challenge) {
    // 可选：校验 token
    if (VERIFY_TOKEN && body.token && body.token !== VERIFY_TOKEN) {
      return res.status(401).json({ msg: "invalid verification token" });
    }
    return res.json({ challenge: body.challenge });
  }

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