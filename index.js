import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

const VERIFY_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN;

// 健康检查
app.get("/", (req, res) => res.status(200).send("ok"));

// 探针：浏览器打开必须看到 JSON
app.get("/webhook/feishu", (req, res) => {
  return res.status(200).json({ ok: true, msg: "webhook endpoint reachable" });
});

// 飞书事件回调入口
app.post("/webhook/feishu", (req, res) => {
  const body = req.body || {};

  console.log("Incoming headers:", JSON.stringify(req.headers));
  console.log("Incoming body:", JSON.stringify(body));

  // 1) URL 验证：只要带 challenge 就返回
  if (body.challenge) {
    // 可选：校验 token（飞书 url_verification 里通常是 body.token）
    if (VERIFY_TOKEN && body.token && body.token !== VERIFY_TOKEN) {
      return res.status(401).json({ msg: "invalid verification token" });
    }
    return res.status(200).json({ challenge: body.challenge });
  }

  // 2) 普通事件：校验 token（事件里是 body.header.token）
  if (VERIFY_TOKEN && body?.header?.token && body.header.token !== VERIFY_TOKEN) {
    return res.status(401).json({ msg: "invalid verification token" });
  }

  // 3) 打印事件结构
  console.log("Feishu event received:", JSON.stringify(body));

  // 4) ACK
  return res.status(200).json({ ok: true });
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`));