import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProfileData {
  id: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  status: string;
  createdAt: string;
  profile: {
    fullName: string;
    city: string;
    state: string;
    religion: string;
    caste: string;
    height: number | null;
    qualification: string | null;
    occupationType: string | null;
    profileCompletionPct: number;
    maritalStatus?: string;
    weight?: number | null;
    bloodGroup?: string;
    physicalStatus?: string;
    aboutMe?: string;
    alternatePhone?: string;
    country?: string;
    postalCode?: string;
    currentAddress?: string;
    subCaste?: string;
    motherTongue?: string;
    gothram?: string;
    university?: string;
    employerName?: string;
    annualIncome?: string;
    workCity?: string;
    workState?: string;
    fatherName?: string;
    fatherOccupation?: string;
    motherName?: string;
    motherOccupation?: string;
    brothersCount?: number | null;
    marriedBrothers?: number | null;
    sistersCount?: number | null;
    marriedSisters?: number | null;
    familyType?: string;
    familyStatus?: string;
    diet?: string;
    smoking?: string;
    drinking?: string;
    partnerExpectations?: string;
  } | null;
  kycSubmissions: { id: string; status: string; mode: string | null; createdAt: string; attempts: number }[];
  subscriptions: { plan: { name: string; tier: string }; status: string; endDate: string }[];
  images: { id: string; status: string; isPrimary: boolean; category: string; url?: string }[];
  auditLogs?: { id: string; action: string; ipAddress: string | null; createdAt: string }[];
}

export async function generateProfilePDF(user: ProfileData, imageUrls: string[] = []): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(123, 29, 29);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Matrimony Platform", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Profile Report", pageWidth / 2, 30, { align: "center" });

  yPosition = 50;

  // Profile Photo (if available)
  if (imageUrls.length > 0) {
    try {
      const imgData = await loadImage(imageUrls[0]);
      const imgSize = 50;
      doc.addImage(imgData, "JPEG", pageWidth / 2 - imgSize / 2, yPosition, imgSize, imgSize);
      yPosition += imgSize + 10;
    } catch (e) {
      // If image fails to load, continue without it
    }
  }

  // User Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", 20, yPosition);
  yPosition += 10;

  const personalInfo = [
    ["Name", user.profile?.fullName || "N/A"],
    ["Email", user.email],
    ["Phone", user.phone || "N/A"],
    ["Gender", user.gender],
    ["Date of Birth", user.dateOfBirth],
    ["Age", user.dateOfBirth ? `${calculateAge(user.dateOfBirth)} years` : "N/A"],
    ["Status", user.status],
    ["Joined", formatDate(user.createdAt)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: personalInfo,
    theme: "grid",
    headStyles: { fillColor: [123, 29, 29], textColor: 255 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Profile Details Section
  if (user.profile) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Profile Details", 20, yPosition);
    yPosition += 10;

    const profileDetails = [
      ["Religion", user.profile.religion || "N/A"],
      ["Caste", user.profile.caste || "N/A"],
      ["Sub Caste", user.profile.subCaste || "N/A"],
      ["Mother Tongue", user.profile.motherTongue || "N/A"],
      ["Gothram", user.profile.gothram || "N/A"],
      ["Height", user.profile.height ? `${user.profile.height} cm` : "N/A"],
      ["Weight", user.profile.weight ? `${user.profile.weight} kg` : "N/A"],
      ["Blood Group", user.profile.bloodGroup || "N/A"],
      ["Physical Status", user.profile.physicalStatus || "N/A"],
      ["Marital Status", user.profile.maritalStatus || "N/A"],
      ["Qualification", user.profile.qualification || "N/A"],
      ["University", user.profile.university || "N/A"],
      ["Occupation", user.profile.occupationType || "N/A"],
      ["Employer", user.profile.employerName || "N/A"],
      ["Annual Income", user.profile.annualIncome || "N/A"],
      ["City", user.profile.city || "N/A"],
      ["State", user.profile.state || "N/A"],
      ["Country", user.profile.country || "N/A"],
      ["Postal Code", user.profile.postalCode || "N/A"],
      ["Work City", user.profile.workCity || "N/A"],
      ["Work State", user.profile.workState || "N/A"],
      ["Profile Completion", `${user.profile.profileCompletionPct}%`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: profileDetails,
      theme: "grid",
      headStyles: { fillColor: [123, 29, 29], textColor: 255 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // About Me
    if (user.profile.aboutMe) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("About Me", 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitAbout = doc.splitTextToSize(user.profile.aboutMe, pageWidth - 40);
      doc.text(splitAbout, 20, yPosition);
      yPosition += splitAbout.length * 5 + 10;
    }

    // Address
    if (user.profile.currentAddress) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Current Address", 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitAddress = doc.splitTextToSize(user.profile.currentAddress, pageWidth - 40);
      doc.text(splitAddress, 20, yPosition);
      yPosition += splitAddress.length * 5 + 10;
    }
  }

  // Family Details
  if (user.profile) {
    yPosition = checkNewPage(doc, yPosition, 40);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Family Details", 20, yPosition);
    yPosition += 10;

    const familyDetails = [
      ["Father Name", user.profile.fatherName || "N/A"],
      ["Father Occupation", user.profile.fatherOccupation || "N/A"],
      ["Mother Name", user.profile.motherName || "N/A"],
      ["Mother Occupation", user.profile.motherOccupation || "N/A"],
      ["Brothers", user.profile.brothersCount?.toString() || "N/A"],
      ["Married Brothers", user.profile.marriedBrothers?.toString() || "N/A"],
      ["Sisters", user.profile.sistersCount?.toString() || "N/A"],
      ["Married Sisters", user.profile.marriedSisters?.toString() || "N/A"],
      ["Family Type", user.profile.familyType || "N/A"],
      ["Family Status", user.profile.familyStatus || "N/A"],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: familyDetails,
      theme: "grid",
      headStyles: { fillColor: [123, 29, 29], textColor: 255 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Lifestyle
    yPosition = checkNewPage(doc, yPosition, 40);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Lifestyle", 20, yPosition);
    yPosition += 10;

    const lifestyleDetails = [
      ["Diet", user.profile.diet || "N/A"],
      ["Smoking", user.profile.smoking || "N/A"],
      ["Drinking", user.profile.drinking || "N/A"],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Field", "Value"]],
      body: lifestyleDetails,
      theme: "grid",
      headStyles: { fillColor: [123, 29, 29], textColor: 255 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: "auto" } },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Partner Expectations
    if (user.profile.partnerExpectations) {
      yPosition = checkNewPage(doc, yPosition, 40);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Partner Expectations", 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const splitExpectations = doc.splitTextToSize(user.profile.partnerExpectations, pageWidth - 40);
      doc.text(splitExpectations, 20, yPosition);
      yPosition += splitExpectations.length * 5 + 10;
    }
  }

  // Images Section
  yPosition = checkNewPage(doc, yPosition, 40);
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Images", 20, yPosition);
  yPosition += 10;

  const imageStats = [
    ["Total Images", user.images.length.toString()],
    ["Approved", user.images.filter(i => i.status === "APPROVED").length.toString()],
    ["Pending", user.images.filter(i => i.status === "PENDING").length.toString()],
    ["Rejected", user.images.filter(i => i.status === "REJECTED").length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Status", "Count"]],
    body: imageStats,
    theme: "grid",
    headStyles: { fillColor: [123, 29, 29], textColor: 255 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Add images to PDF
  if (imageUrls.length > 0) {
    yPosition = checkNewPage(doc, yPosition, 120);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Profile Photos", 20, yPosition);
    yPosition += 10;

    const imgSize = 60;
    const cols = 3;
    const startX = 20;
    const startY = yPosition;
    const gap = 15;
    let loadedCount = 0;

    for (let i = 0; i < Math.min(imageUrls.length, 12); i++) {
      try {
        const imgData = await loadImage(imageUrls[i]);
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (imgSize + gap);
        const y = startY + row * (imgSize + gap);
        
        // Check if we need a new page
        if (y + imgSize > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.addImage(imgData, "JPEG", x, y, imgSize, imgSize);
        loadedCount++;
        
        // Add image status label
        const imgInfo = user.images[i];
        if (imgInfo) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(imgInfo.status, x + imgSize / 2, y + imgSize + 5, { align: "center" });
        }
      } catch (e) {
        console.error(`Failed to load image ${i}:`, e);
      }
    }

    if (loadedCount === 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text("No images could be loaded. Check browser console for details.", 20, startY + 10);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(128, 128, 128);
      doc.text(`Loaded ${loadedCount} of ${imageUrls.length} images`, 20, startY + 10);
      doc.setTextColor(0, 0, 0);
    }
  } else {
    yPosition = checkNewPage(doc, yPosition, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("No approved images available for download.", 20, yPosition);
    doc.setTextColor(0, 0, 0);
  }

  // Audit Log
  if (user.auditLogs && user.auditLogs.length > 0) {
    yPosition = checkNewPage(doc, yPosition, 40);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Activity", 20, yPosition);
    yPosition += 10;

    const logData = user.auditLogs.slice(0, 10).map(log => [
      log.action,
      log.ipAddress || "N/A",
      formatDateTime(log.createdAt),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Action", "IP Address", "Date/Time"]],
      body: logData,
      theme: "grid",
      headStyles: { fillColor: [123, 29, 29], textColor: 255 },
    });
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save PDF
  const fileName = `profile_${user.profile?.fullName?.replace(/\s+/g, "_") || user.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function loadImage(url: string): Promise<string> {
  try {
    console.log("Loading image from URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    console.log("Image blob size:", blob.size, "type:", blob.type);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image converted to data URL successfully");
        resolve(reader.result as string);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        reject(e);
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Error loading image:", e);
    throw e;
  }
}

function checkNewPage(doc: jsPDF, yPosition: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPosition + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return yPosition;
}
