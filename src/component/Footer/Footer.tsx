// import visa from "@/assets/visa-mastercard-logo.webp";
// import momo from "@/assets/MoMo_Logo.webp";
// import banking from "@/assets/internetBanking.png";
// import vnpay from "@/assets/vnpay.webp";
// import vcb from "@/assets/VCBLogo.webp";
// import tcb from "@/assets/Techcombank_logo.webp";
// import agb from "@/assets/Argibank_logo.webp";
// import mb from "@/assets/Logo_MB_new.webp";
// import acb from "@/assets/Asia_Commercial_Bank_logo.webp";
// import vpb from "@/assets/VPBank_logo.webp";
// import bidv from "@/assets/Logo_BIDV.webp";
import logo from "../../assets/images/FoCode Logo.png";
import mail from "../../assets/images/gmaillogo.png";
import fb from "../../assets/images/facebookLogo.png";
import zalo from "../../assets/images/logoZalo.png";

const footerLinks = [
  {
    title: "Cơ sở y tế",
    links: [
      { label: "Bệnh viện", href: "/help/gioi-thieu" },
      { label: "Phòng khám", href: "/help/chinh-sach-bao-mat" },
      { label: "Xét nghiệm", href: "/help/chinh-sach-hoan-tien" },
      { label: "Tiêm chủng", href: "/help/dieu-khoan-dich-vu" },
    ],
  },
  {
    title: "Dịch vụ y tế",
    links: [
      { label: "Đặt lịch khám bệnh", href: "/help/huong-dan-mua-hang" },
      { label: "Đặt lịch xét nghiệm", href: "/help/huong-dan-nap-tien" },
      { label: "Đặt lịch tiêm chủng", href: "/help/huong-dan-rut-tien" },
      { label: "Kê thuốc theo toa", href: "/help/tai-len-code" },
    ],
  },
];

const socialLinks = [
  {
    href: "/help/tai-len-code",
    alt: "Facebook",
    src: fb,
  },
  {
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=dev@fotech.pro&su=Hỗ trợ từ khách hàng&body=Chào%20FoCode%2C%0ATôi%20muốn%20hỏi%20về...",
    alt: "Gmail",
    src: mail,
  },
  {
    href: "/help/tai-len-code",
    alt: "Zalo",
    src: zalo,
  },
];

const support = [
  {
    label: "Hướng dẫn đặt lịch",
    href: "/help/tai-len-code",
  },
  {
    label: "Hướng dẫn kê toa thuốc",
    href: "/help/tai-len-code",
  },
  {
    label: "Hướng dẫn xem kết quả",
    href: "/help/tai-len-code",
  },
  {
    label: "Hướng dẫn xem hóa đơn",
    href: "/help/tai-len-code",
  },
  {
    label: "Hướng dẫn thanh toán",
    href: "/help/tai-len-code",
  },
];

const aboutus = [
  {
    title: "Về FoMed",
    links: [
      { label: "Giới thiệu", href: "/help/tai-len-code" },
      { label: "Điều khoản dịch vụ", href: "/help/tai-len-code" },
      { label: "Chính sách bảo mật", href: "/help/tai-len-code" },
      { label: "Quy định sử dụng", href: "/help/tai-len-code" },
      { label: "Tin tức", href: "/help/tai-len-code" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-white text-black py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 px-4 md:px-2 xl:px-0">
        {/* LOGO & MẠNG XÃ HỘI */}
        <div>
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <p className="font-bold text-sky-500 text-6xl">Med</p>
          </div>
          <p className="text-sm">
            Địa chỉ: 112 Cao Thắng, Phường 4, Quận 3, TP. Hồ Chí Minh
          </p>
          <div className="flex space-x-4 mt-3">
            {socialLinks.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`h-6 w-auto ${
                    item.alt === "LinkedIn" ? "rounded-full" : ""
                  }`}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

        {aboutus.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-bold">{section.title}</h3>
            <ul className="mt-2 space-y-1">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[var(--hover)]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CÁC MỤC LIÊN KẾT */}
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-bold">{section.title}</h3>
            <ul className="mt-2 space-y-1">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-[var(--hover)]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-lg font-bold">Hướng dẫn sử dụng</h3>
          <ul className="mt-2 space-y-1 ">
            {support.map((sp) => (
              <li key={sp.href}>
                <a href={sp.href} className="hover:text-[var(--hover)]">
                  {sp.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-300 pt-6 text-center text-sm">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://page.fotech.pro/"
          target="blank"
          className="font-bold text-sky-500"
        >
          FoTech JSC
        </a>
        . All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
