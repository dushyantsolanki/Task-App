import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  count: { type: Number, default: 1 },
});

const PortfolioVisitor = mongoose.model('PortfolioVisit', VisitSchema);

export default PortfolioVisitor;
