using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Notla.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddTrendMetricsToNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SalesCount",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "Notes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalesCount",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Notes");
        }
    }
}
