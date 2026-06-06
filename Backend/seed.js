import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.model.js';
import Vendor from './models/Vendor.model.js';
import RFQ from './models/RFQ.model.js';
import Quotation from './models/Quotation.model.js';
import Approval from './models/Approval.model.js';
import PurchaseOrder from './models/PurchaseOrder.model.js';
import Invoice from './models/Invoice.model.js';
import ActivityLog from './models/ActivityLog.model.js';

const seed = async () => {
  // Connect to Database
  await connectDB();

  console.log('Clearing existing test collections...');
  
  // Clean up existing test data
  await User.deleteMany({ email: /^test_/ });
  await Vendor.deleteMany({ email: /^test_/ });
  await RFQ.deleteMany({});
  await Quotation.deleteMany({});
  await Approval.deleteMany({});
  await PurchaseOrder.deleteMany({});
  await Invoice.deleteMany({});
  await ActivityLog.deleteMany({});

  console.log('Generating password hashes...');
  const hashedPassword = await bcrypt.hash('TestPass123', 12);

  // 1. Create Default Role Users
  const admin = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'test_admin@vendorbridge.com',
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    isActive: true,
  });
  console.log('Created Admin User: test_admin@vendorbridge.com');

  const manager = await User.create({
    firstName: 'Procurement',
    lastName: 'Manager',
    email: 'test_manager@vendorbridge.com',
    password: hashedPassword,
    role: 'manager',
    isVerified: true,
    isActive: true,
  });
  console.log('Created Manager User: test_manager@vendorbridge.com');

  const officer = await User.create({
    firstName: 'Procurement',
    lastName: 'Officer',
    email: 'test_officer@vendorbridge.com',
    password: hashedPassword,
    role: 'officer',
    isVerified: true,
    isActive: true,
  });
  console.log('Created Officer User: test_officer@vendorbridge.com');

  // 2. Create 3 Vendor Users
  const vendorUser1 = await User.create({
    firstName: 'Acme',
    lastName: 'Supplier',
    email: 'test_vendor1@vendorbridge.com',
    password: hashedPassword,
    role: 'vendor',
    isVerified: true,
    isActive: true,
  });
  const vendorUser2 = await User.create({
    firstName: 'Globex',
    lastName: 'Logistics',
    email: 'test_vendor2@vendorbridge.com',
    password: hashedPassword,
    role: 'vendor',
    isVerified: true,
    isActive: true,
  });
  const vendorUser3 = await User.create({
    firstName: 'Initech',
    lastName: 'Hardware',
    email: 'test_vendor3@vendorbridge.com',
    password: hashedPassword,
    role: 'vendor',
    isVerified: true,
    isActive: true,
  });
  console.log('Created 3 Vendor Users');

  // 3. Create 3 Vendor Profiles
  const vendor1 = await Vendor.create({
    companyName: 'Acme Supplies Pvt Ltd',
    category: 'IT & Hardware',
    gstNumber: '29AAAAA1111A1Z1',
    contactPerson: 'Acme Supplier',
    email: 'test_vendor1@vendorbridge.com',
    phone: '+919876543210',
    country: 'India',
    address: '123 Industrial Area, Bangalore, KA, 560001',
    status: 'active',
    rating: 4.8,
    totalOrders: 4,
    totalSpend: 450000,
    linkedUser: vendorUser1._id,
    createdBy: officer._id,
  });
  const vendor2 = await Vendor.create({
    companyName: 'Globex Logistics Corp',
    category: 'Logistics',
    gstNumber: '27BBBBB2222B2Z2',
    contactPerson: 'Globex Supplier',
    email: 'test_vendor2@vendorbridge.com',
    phone: '+919998887776',
    country: 'India',
    address: '456 Shipping Terminal, Mumbai, MH, 400001',
    status: 'active',
    rating: 4.2,
    totalOrders: 2,
    totalSpend: 150000,
    linkedUser: vendorUser2._id,
    createdBy: officer._id,
  });
  const vendor3 = await Vendor.create({
    companyName: 'Initech Office Solutions',
    category: 'Office Supplies',
    gstNumber: '24CCCCC3333C3Z3',
    contactPerson: 'Initech Supplier',
    email: 'test_vendor3@vendorbridge.com',
    phone: '+918887776665',
    country: 'India',
    address: '789 Business Park, Hyderabad, TS, 500001',
    status: 'pending',
    rating: 3.5,
    totalOrders: 0,
    totalSpend: 0,
    linkedUser: vendorUser3._id,
    createdBy: officer._id,
  });
  console.log('Created 3 Vendor Profiles');

  // 4. Create 3 RFQs
  const rfq1 = await RFQ.create({
    rfqNumber: 'RFQ-2026-0001',
    title: 'Annual IT Laptops Procurement',
    category: 'IT & Hardware',
    description: 'Procurement of 10 high-performance developer laptops with 32GB RAM and 1TB SSD.',
    lineItems: [
      { item: 'Developer Laptops (Core i7 / 32GB / 1TB SSD)', qty: 10, unit: 'units' }
    ],
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
    status: 'published',
    assignedVendors: [vendor1._id],
    createdBy: officer._id,
  });
  const rfq2 = await RFQ.create({
    rfqNumber: 'RFQ-2026-0002',
    title: 'Warehouse Logistics & Shipping Service',
    category: 'Logistics',
    description: 'Shipping service contract for interstate inventory redistribution.',
    lineItems: [
      { item: 'Interstate Transport ( Bangalore to Mumbai )', qty: 25, unit: 'trips' }
    ],
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
    status: 'published',
    assignedVendors: [vendor2._id],
    createdBy: officer._id,
  });
  const rfq3 = await RFQ.create({
    rfqNumber: 'RFQ-2026-0003',
    title: 'Executive Office Desks & Ergonomic Chairs',
    category: 'Office Supplies',
    description: 'Sleek ergonomic chairs and custom executive desks for administrative cabin remodel.',
    lineItems: [
      { item: 'Ergonomic Mesh Chairs', qty: 30, unit: 'units' },
      { item: 'Executive Wooden Desks', qty: 15, unit: 'units' }
    ],
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days in past (closed)
    status: 'closed',
    assignedVendors: [vendor1._id, vendor3._id],
    createdBy: officer._id,
  });
  console.log('Created 3 RFQs (IT, Logistics, Office Supplies)');

  // 5. Create Quotations for RFQ 1 & 3
  const quote1 = await Quotation.create({
    rfq: rfq1._id,
    vendor: vendor1._id,
    items: [
      { item: 'Developer Laptops (Core i7 / 32GB / 1TB SSD)', qty: 10, unitPrice: 75000, total: 750000 }
    ],
    subtotal: 750000,
    gstPercent: 18,
    gstAmount: 135000,
    grandTotal: 885000,
    deliveryDays: 7,
    paymentTerms: '30 Days Net',
    notes: 'Official quotes including 3 years onsite hardware warranty support.',
    status: 'submitted',
    submittedAt: new Date(),
  });
  rfq1.quotationCount = 1;
  await rfq1.save();

  const quote2 = await Quotation.create({
    rfq: rfq3._id,
    vendor: vendor1._id,
    items: [
      { item: 'Ergonomic Mesh Chairs', qty: 30, unitPrice: 8000, total: 240000 },
      { item: 'Executive Wooden Desks', qty: 15, unitPrice: 20000, total: 300000 }
    ],
    subtotal: 540000,
    gstPercent: 18,
    gstAmount: 97200,
    grandTotal: 637200,
    deliveryDays: 15,
    paymentTerms: '50% advance, 50% delivery',
    notes: 'Premium ergonomic designs with lumbar support adjustment.',
    status: 'selected',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  const quote3 = await Quotation.create({
    rfq: rfq3._id,
    vendor: vendor3._id,
    items: [
      { item: 'Ergonomic Mesh Chairs', qty: 30, unitPrice: 6500, total: 195000 },
      { item: 'Executive Wooden Desks', qty: 15, unitPrice: 18000, total: 270000 }
    ],
    subtotal: 465000,
    gstPercent: 18,
    gstAmount: 83700,
    grandTotal: 548700,
    deliveryDays: 20,
    paymentTerms: '100% post-delivery verification',
    notes: 'Standard office collection with 1 year warranty.',
    status: 'submitted',
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });
  rfq3.quotationCount = 2;
  await rfq3.save();
  console.log('Created Quotations & updated RFQ Bid counts');

  // 6. Create Approvals
  const approval1 = await Approval.create({
    quotation: quote2._id,
    rfq: rfq3._id,
    vendor: vendor1._id,
    steps: [
      { approver: manager._id, role: 'manager', label: 'L1 Manager Review', status: 'approved', remarks: 'Good deal, let us proceed.', actionAt: new Date() },
      { role: 'manager', label: 'L2 Manager Authorization', status: 'pending' }
    ],
    currentStep: 1,
    overallStatus: 'pending',
    amount: 637200,
    initiatedBy: officer._id,
  });
  console.log('Created pending multi-level Approval document');

  // 7. Create past Purchase Orders & Invoices for analytics trends
  const mockApprovedApproval = await Approval.create({
    quotation: quote2._id,
    rfq: rfq3._id,
    vendor: vendor1._id,
    steps: [
      { approver: manager._id, role: 'manager', label: 'L1 Manager Review', status: 'approved', remarks: 'Approved.', actionAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { approver: manager._id, role: 'manager', label: 'L2 Manager Authorization', status: 'approved', remarks: 'Final signoff.', actionAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    ],
    currentStep: 2,
    overallStatus: 'approved',
    amount: 637200,
    initiatedBy: officer._id,
  });

  const po = await PurchaseOrder.create({
    poNumber: 'PO-2026-0001',
    rfq: rfq3._id,
    vendor: vendor1._id,
    quotation: quote2._id,
    approval: mockApprovedApproval._id,
    lineItems: [
      { item: 'Ergonomic Mesh Chairs', qty: 30, unitPrice: 8000, total: 240000 },
      { item: 'Executive Wooden Desks', qty: 15, unitPrice: 20000, total: 300000 }
    ],
    subtotal: 540000,
    cgstAmount: 48600,
    sgstAmount: 48600,
    grandTotal: 637200,
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: 'delivered',
    issuedBy: officer._id,
    issuedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
    orgName: 'VendorBridge Corporation',
    orgAddress: '404 ERP Square, Tech Park, Bangalore, KA, 560103',
    orgGst: '29CORP1234A1Z9',
  });
  console.log('Created completed Purchase Order: PO-2026-0001');

  const invoice = await Invoice.create({
    invoiceNumber: 'INV-2026-0001',
    po: po._id,
    vendor: vendor1._id,
    lineItems: [
      { item: 'Ergonomic Mesh Chairs', qty: 30, unitPrice: 8000, total: 240000 },
      { item: 'Executive Wooden Desks', qty: 15, unitPrice: 20000, total: 300000 }
    ],
    subtotal: 540000,
    cgst: 48600,
    sgst: 48600,
    grandTotal: 637200,
    invoiceDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'paid',
    pdfUrl: 'https://ik.imagekit.io/developer-placeholder-endpoint/INV-2026-0001.pdf',
    pdfFileId: 'sample-pdf-file-id-1',
    sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });
  console.log('Created paid Tax Invoice: INV-2026-0001');

  // Let's create another past invoice for monthly spend trend (e.g. 2 months ago)
  const poPast = await PurchaseOrder.create({
    poNumber: 'PO-2026-0002',
    vendor: vendor2._id,
    lineItems: [
      { item: 'Logistics Transport Services', qty: 1, unitPrice: 150000, total: 150000 }
    ],
    subtotal: 150000,
    cgstAmount: 13500,
    sgstAmount: 13500,
    grandTotal: 177000,
    status: 'delivered',
    issuedBy: officer._id,
    issuedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  });

  await Invoice.create({
    invoiceNumber: 'INV-2026-0002',
    po: poPast._id,
    vendor: vendor2._id,
    lineItems: [
      { item: 'Logistics Transport Services', qty: 1, unitPrice: 150000, total: 150000 }
    ],
    subtotal: 150000,
    cgst: 13500,
    sgst: 13500,
    grandTotal: 177000,
    invoiceDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    status: 'paid',
    pdfUrl: 'https://ik.imagekit.io/developer-placeholder-endpoint/INV-2026-0002.pdf',
    sentAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
    paidAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  });
  console.log('Created older paid Tax Invoice for Recharts metrics');

  // 8. Create some activity logs
  await ActivityLog.create({ action: 'USER_REGISTERED', entity: 'user', entityId: admin._id, entityTitle: 'System Admin', performedBy: admin._id });
  await ActivityLog.create({ action: 'VENDOR_CREATED', entity: 'vendor', entityId: vendor1._id, entityTitle: 'Acme Supplies Pvt Ltd', performedBy: officer._id });
  await ActivityLog.create({ action: 'RFQ_CREATED', entity: 'rfq', entityId: rfq1._id, entityTitle: 'Annual IT Laptops Procurement', performedBy: officer._id });
  await ActivityLog.create({ action: 'RFQ_PUBLISHED', entity: 'rfq', entityId: rfq1._id, entityTitle: 'Annual IT Laptops Procurement', performedBy: officer._id });
  await ActivityLog.create({ action: 'QUOTATION_SUBMITTED', entity: 'quotation', entityId: quote2._id, entityTitle: 'Quote for Office Cabin Remodel', performedBy: vendorUser1._id });
  await ActivityLog.create({ action: 'QUOTATION_SELECTED', entity: 'quotation', entityId: quote2._id, entityTitle: 'Quote for Office Cabin Remodel', performedBy: officer._id });
  await ActivityLog.create({ action: 'APPROVAL_STEP_COMPLETED', entity: 'approval', entityId: approval1._id, entityTitle: 'L1 Manager approval', performedBy: manager._id });
  console.log('Created Audit Trail Activity logs');

  console.log('\n==================================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log('==================================================');
  console.log('Use the following credentials to log in:');
  console.log('Password for all users: TestPass123\n');
  console.log('1. Admin:     test_admin@vendorbridge.com');
  console.log('2. Manager:   test_manager@vendorbridge.com');
  console.log('3. Officer:   test_officer@vendorbridge.com');
  console.log('4. Vendor 1:  test_vendor1@vendorbridge.com (Acme)');
  console.log('5. Vendor 2:  test_vendor2@vendorbridge.com (Globex)');
  console.log('6. Vendor 3:  test_vendor3@vendorbridge.com (Initech)');
  console.log('==================================================\n');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('Error seeding database:', err);
  mongoose.connection.close();
});
