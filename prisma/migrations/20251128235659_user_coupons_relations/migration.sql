-- CreateTable
CREATE TABLE "_AssignedCoupons" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AssignedCoupons_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AssignedCoupons_B_index" ON "_AssignedCoupons"("B");

-- AddForeignKey
ALTER TABLE "_AssignedCoupons" ADD CONSTRAINT "_AssignedCoupons_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignedCoupons" ADD CONSTRAINT "_AssignedCoupons_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
