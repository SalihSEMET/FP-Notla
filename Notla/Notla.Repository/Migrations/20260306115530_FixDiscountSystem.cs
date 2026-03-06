using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Notla.Repository.Migrations
{
    /// <inheritdoc />
    public partial class FixDiscountSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SellerID",
                table: "DiscountCodes",
                newName: "SellerId");

            migrationBuilder.RenameColumn(
                name: "MinumumCardAmount",
                table: "DiscountCodes",
                newName: "MinimumCartAmount");

            migrationBuilder.RenameColumn(
                name: "ExpiryDate",
                table: "DiscountCodes",
                newName: "ExpirationDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SellerId",
                table: "DiscountCodes",
                newName: "SellerID");

            migrationBuilder.RenameColumn(
                name: "MinimumCartAmount",
                table: "DiscountCodes",
                newName: "MinumumCardAmount");

            migrationBuilder.RenameColumn(
                name: "ExpirationDate",
                table: "DiscountCodes",
                newName: "ExpiryDate");
        }
    }
}
